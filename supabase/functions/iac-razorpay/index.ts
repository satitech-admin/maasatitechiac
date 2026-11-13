
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.119.0";
const URL_BASE = Deno.env.get("SUPABASE_URL") || "";
const SRV = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const KEY_ID = Deno.env.get("RAZORPAY_KEY_ID") || "";
const KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET") || "";
const WEBHOOK_SECRET = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") || "";
const ALLOWED = "https://maasatitechiac.vercel.app";
const admin = createClient(URL_BASE, SRV, { auth: { autoRefreshToken: false, persistSession: false } });
function response(body,status=200, origin=ALLOWED){
 return new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":origin,"Access-Control-Allow-Headers":"authorization,apikey,content-type","Access-Control-Allow-Methods":"POST,OPTIONS","Vary":"Origin","Cache-Control":"no-store"}});
}
const enc = new TextEncoder();
async function hmac(message,key){
 const cryptoKey=await crypto.subtle.importKey("raw",enc.encode(key),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
 const bytes=new Uint8Array(await crypto.subtle.sign("HMAC",cryptoKey,enc.encode(message)));
 return [...bytes].map(v=>v.toString(16).padStart(2,"0")).join("");
}
function eqHex(a,b){
 if(!/^[a-f0-9]{64}$/i.test(a||"")||!/^[a-f0-9]{64}$/i.test(b||"")) return false;
 let d=0;for(let i=0;i<64;i++) d|=a.toLowerCase().charCodeAt(i)^b.toLowerCase().charCodeAt(i);
 return d===0;
}
const razorAuth=()=> "Basic "+btoa(KEY_ID+":"+KEY_SECRET);
async function rz(path,method="GET",data=null){
 const res=await fetch("https://api.razorpay.com/v1/"+path,{
  method,headers:{"Authorization":razorAuth(),"Content-Type":"application/json"},
  body:data?JSON.stringify(data):undefined
 });
 const body=await res.json().catch(()=>({}));
 if(!res.ok) throw new Error("Razorpay returned "+res.status);
 return body;
}
async function getUser(req){
 const token=(req.headers.get("Authorization")||"").replace(/^Bearer\s+/i,"");
 if(!token||token.length<30) throw new Error("Please sign in first.");
 const result=await admin.auth.getUser(token);
 if(result.error||!result.data.user)throw new Error("Session invalid. Sign in again.");
 return result.data.user;
}
async function processCaptured(payment, eventId) {
 if(payment?.status!=="captured"||!payment?.order_id||!payment?.id||payment.currency!=="INR") return false;
 if(!Number.isInteger(payment.amount)||payment.amount<100) return false;
 const {data,error}=await admin.rpc("iac_process_captured_payment",{
 p_order_id:payment.order_id,p_payment_id:payment.id,p_amount_paise:payment.amount,p_currency:payment.currency,p_provider_event_id:eventId
 });
 if(error)throw new Error("Payment reconciliation failed: "+error.message);
 return data===true;
}
Deno.serve(async req=>{
 const origin=req.headers.get("Origin")||"";
 const permitted=origin===ALLOWED||!origin;
 if(req.method==="OPTIONS") return new Response(null,{status:permitted?204:403,headers:{"Access-Control-Allow-Origin":permitted?ALLOWED:"null","Access-Control-Allow-Headers":"authorization,apikey,content-type","Access-Control-Allow-Methods":"POST,OPTIONS"}});
 if(req.method!=="POST")return response({error:"Only POST supported"},405);
 if(!permitted) return response({error:"Origin not permitted"},403);
 try{
  const url=new URL(req.url);
  if(url.pathname.endsWith("/webhook")){
   if(!WEBHOOK_SECRET)return response({error:"Webhook not configured"},503);
   const raw=await req.text();
   if(raw.length>2000000)return response({error:"Payload too large"},413);
   const expected=await hmac(raw,WEBHOOK_SECRET);
   if(!eqHex(expected,req.headers.get("X-Razorpay-Signature")||""))return response({error:"Invalid webhook signature"},401);
   const event=JSON.parse(raw);
   const eventId=req.headers.get("x-razorpay-event-id")||"";
   if(!eventId)return response({error:"Missing webhook event ID"},400);
   if(event.event==="payment.captured"){
    if(!KEY_ID||!KEY_SECRET)return response({error:"Merchant API unavailable"},503);
    const paymentId=event.payload?.payment?.entity?.id;
    if(typeof paymentId!=="string"||!/^pay_[A-Za-z0-9]+$/.test(paymentId))return response({error:"Invalid payment ID"},400);
    const verified=await rz("payments/"+encodeURIComponent(paymentId));
    if(!await processCaptured(verified,eventId))return response({error:"Payment not captured"},409);
   }
   return response({received:true});
  }
  const user=await getUser(req);
  const input=await req.json().catch(()=>({}));
  const action=String(input.action||"");
  if(action==="status") {
   const {data,error}=await admin.from("iac_payment_orders").select("id,product_type,course_id,event_id,amount_paise,currency,status,paid_at,created_at").eq("student_id",user.id).order("created_at",{ascending:false}).limit(30);
   if(error)throw error;
   return response({orders:data});
  }
  if(action==="availability")return response({configured:!!(KEY_ID&&KEY_SECRET),currency:"INR"});
  if(!KEY_ID||!KEY_SECRET)return response({error:"Razorpay merchant credentials are not configured. Checkout is disabled."},503);
  if(action==="create-order"){
   if(String(input.product_type||"")==="course")return response({error:"Monthly course installment and renewal billing are not activated yet. Contact the institute; no payment was collected."},409);

   const typ=String(input.product_type||"");
   const id=String(input.product_id||"");
   if(!["course","event"].includes(typ)||!/^[0-9a-f-]{36}$/i.test(id))return response({error:"Invalid program"},400);
   // Refuse a checkout before any Razorpay order is created if student eligibility or verified guardian consent is missing.
   // The RPC executes with the service-role credential on this server only; no credential is returned to the browser.
   const eligibility=await admin.rpc("iac_guardian_ready",{p_user:user.id});
   if(eligibility.error)return response({error:"Unable to verify student checkout eligibility. Contact institute support."},503);
   if(eligibility.data!==true)return response({error:"Complete your student profile and required guardian verification in Onboarding before payment."},403);

   const table=typ==="course"?"iac_courses":"iac_events";
   const {data:item,error:loadError}=await admin.from(table).select("id,title,fee_paise,published").eq("id",id).single();
   if(loadError||!item?.published)return response({error:"Program not available"},404);
   if(!Number.isInteger(item.fee_paise)||item.fee_paise<100)return response({error:"Fees not configured for this program"},409);
   const membership=typ==="course"
      ?await admin.from("iac_enrollments").select("id,status").eq("user_id",user.id).eq("course_id",id).maybeSingle()
      :await admin.from("iac_event_registrations").select("id").eq("user_id",user.id).eq("event_id",id).maybeSingle();
   if(membership.error||!membership.data)return response({error:"Register for the program before checkout"},409);
   if(typ==="course"&&["active","completed"].includes(membership.data.status))return response({error:"Already enrolled"},409);
   if(typ==="course"&&membership.data.status!=="pending")return response({error:"Enrollment not eligible for checkout"},409);
   const {data:paid,error:paidError}=await admin.from("iac_payment_orders").select("id").eq("student_id",user.id).eq(typ==="course"?"course_id":"event_id",id).eq("status","captured").limit(1);
   if(paidError)throw paidError;
   if(paid?.length)return response({error:"This program has already been paid for"},409);
   const {data:existing}=await admin.from("iac_payment_orders").select("*").eq("student_id",user.id).eq(typ==="course"?"course_id":"event_id",id).eq("status","created").order("created_at",{ascending:false}).limit(1);
   const recent=existing?.[0];
   if(recent && Date.now()-Date.parse(recent.created_at)<20*60*1000 && recent.amount_paise===item.fee_paise){
    return response({key_id:KEY_ID,razorpay_order_id:recent.razorpay_order_id,amount:recent.amount_paise,currency:"INR",description:item.title});
   }
   const receipt="IAC"+crypto.randomUUID().replace(/-/g,"").slice(0,27);
   const order=await rz("orders","POST",{amount:item.fee_paise,currency:"INR",receipt,notes:{product_type:typ,product_id:id}});
   if(!order.id||order.amount!==item.fee_paise||order.currency!=="INR")throw new Error("Razorpay order validation failed");
   const {error:storeError}=await admin.from("iac_payment_orders").insert({
     student_id:user.id,product_type:typ,course_id:typ==="course"?id:null,event_id:typ==="event"?id:null,
     razorpay_order_id:order.id,amount_paise:item.fee_paise,currency:"INR"
   });
   if(storeError)throw storeError;
   return response({key_id:KEY_ID,razorpay_order_id:order.id,amount:order.amount,currency:order.currency,description:item.title});
  }
  if(action==="confirm"){
   const orderId=String(input.razorpay_order_id||"");
   const paymentId=String(input.razorpay_payment_id||"");
   const signature=String(input.razorpay_signature||"");
   if(!/^order_[A-Za-z0-9]+$/.test(orderId)||!/^pay_[A-Za-z0-9]+$/.test(paymentId))return response({error:"Invalid payment details"},400);
   const {data:order,error:e}=await admin.from("iac_payment_orders").select("student_id,razorpay_order_id,status").eq("razorpay_order_id",orderId).single();
   if(e||!order||order.student_id!==user.id)return response({error:"Order does not belong to this student"},403);
   const expected=await hmac(orderId+"|"+paymentId,KEY_SECRET);
   if(!eqHex(expected,signature))return response({error:"Payment signature invalid"},401);
   const payment=await rz("payments/"+encodeURIComponent(paymentId));
   if(payment.order_id!==orderId||payment.status!=="captured")return response({error:"Awaiting captured payment. Check status shortly."},409);
   await processCaptured(payment,"callback:"+paymentId);
   return response({captured:true,message:"Payment verified and recorded"});
  }
  return response({error:"Unknown action"},400);
 }catch(err){
  console.error("Razorpay transaction endpoint error:",String(err).slice(0,160));
  return response({error:"Unable to complete transaction. Please retry or contact the institute."},500);
 }
});
