import PDFDocument from 'pdfkit';
import { COMPANY } from './company';
import { Invoice } from './types';
import { money, dateDMY, dateRange } from './format';
import { numberToIndianWords } from './invoice';
import fs from 'fs';
import path from 'path';

export function buildInvoicePdf(inv: Invoice): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    if (inv.invoiceType === 'housekeeping') drawHousekeeping(doc, inv); else drawCatering(doc, inv);
    doc.end();
  });
}

const W = 595.28, H = 841.89, L = 62, R = 533, TOP = 55, BOTTOM = 780;
function line(doc: PDFKit.PDFDocument, x1:number,y1:number,x2:number,y2:number,w=0.7){doc.lineWidth(w).moveTo(x1,y1).lineTo(x2,y2).stroke();}
function rect(doc: PDFKit.PDFDocument,x:number,y:number,w:number,h:number,lw=0.7){doc.lineWidth(lw).rect(x,y,w,h).stroke();}
function text(doc: PDFKit.PDFDocument,s:string,x:number,y:number,w:number,h:number,opts:any={}){doc.font(opts.bold?'Helvetica-Bold':'Helvetica').fontSize(opts.size??9).text(s,x,y,{width:w,height:h,align:opts.align??'left',lineGap:opts.lineGap??0});}
function drawCatering(doc: PDFKit.PDFDocument, inv: Invoice){
  text(doc,'Taxable Invoice',L,TOP,471,22,{bold:true,size:14,align:'center'}); line(doc,L,TOP+24,L+471,TOP+24,1);
  const y=TOP+25, x=L, w=471, left=210, right=w-left;
  rect(doc,x,y,w,93); line(doc,x+left,y,x+left,y+93,1); line(doc,x+left,y+20,x+w,y+20,0.7);
  const vendor=`${COMPANY.name}\n${COMPANY.address[0]}\n${COMPANY.address[1]}\nContact no    : ${COMPANY.phone}\nGST IN        : ${COMPANY.gstin}\nH/K code      : ${COMPANY.hkCode}\nSAC CODE      : ${COMPANY.sacCode}`;
  text(doc,vendor,x+6,y+4,left-12,84,{size:8.7});
  text(doc,`INVOICE No :  ${inv.invoiceNo}`,x+left+6,y+4,right-12,14,{size:9});
  text(doc,`INVOICE DATE: ${dateDMY(inv.invoiceDate)}`,x+left+6,y+24,right-12,14,{size:9});
  rect(doc,x,y+93,w,70); line(doc,x+left,y+93,x+left,y+163,1);
  const buyer=`BILL TO\n${inv.billToName}\n${inv.billToAddress||''}\nGST NO : ${inv.billToGstin||''}`;
  text(doc,buyer,x+6,y+97,left-12,62,{size:8.7});
  text(doc,`Description: ${inv.billDescription||''}`,x+left+6,y+97,right-12,62,{size:8.7,bold:false});
  const ty=y+163, headerH=25, rowH=Math.max(38, 34*inv.lineItems.length);
  const cols=[0,38,207,286,335,382,471].map(v=>x+v);
  rect(doc,x,ty,w,headerH+rowH+25+20+20+22); cols.forEach(cx=>line(doc,cx,ty,cx,ty+headerH+rowH+87,0.7));
  const headers=['SNO','DESCRIPTION','QUANTITY','RATE','PER','AMOUNT IN\nRs.'];
  for(let i=0;i<6;i++) text(doc,headers[i],cols[i]+4,ty+5,cols[i+1]-cols[i]-8,18,{bold:true,size:8,align:i===1?'left':'center'});
  line(doc,x,ty+headerH,x+w,ty+headerH,0.7);
  inv.lineItems.forEach((it,i)=>{const yy=ty+headerH+i*rowH/inv.lineItems.length; const rh=rowH/inv.lineItems.length; text(doc,String(i+1),cols[0]+5,yy+10,30,rh,{size:8}); text(doc,it.description,cols[1]+5,yy+10,cols[2]-cols[1]-10,rh,{size:8}); text(doc,String(it.quantity),cols[2]+4,yy+10,cols[3]-cols[2]-8,rh,{size:8,align:'center'}); text(doc,money(it.rate),cols[3]+4,yy+10,cols[4]-cols[3]-8,rh,{size:8,align:'center'}); text(doc,it.per||'',cols[4]+4,yy+10,cols[5]-cols[4]-8,rh,{size:8,align:'center'}); text(doc,money(it.quantity*it.rate),cols[5]+5,yy+10,cols[6]-cols[5]-10,rh,{size:8}); line(doc,x,yy+rh,x+w,yy+rh,0.5);});
  let sy=ty+headerH+rowH; const labels=[`TOTAL`,`CGST ${inv.cgstRate}%`,`SGST ${inv.sgstRate}%`,`GRAND TOTAL`], vals=[inv.subtotal,inv.taxCgst,inv.taxSgst,inv.grandTotal];
  const rh2=22; for(let i=0;i<4;i++){line(doc,x+38,sy+i*rh2,x+w,sy+i*rh2,0.5); text(doc,labels[i],x+38,sy+i*rh2+5,344,14,{bold:i===3,size:8.5,align:'right'}); text(doc,money(vals[i]),x+382,sy+i*rh2+5,89,14,{bold:i===3,size:8.5,align:'right'});} line(doc,x+38,sy+4*rh2,x+w,sy+4*rh2,0.7);
  const wy=sy+4*rh2; rect(doc,x+38,wy,w-38,36,0.7); text(doc,`AMOUNT CHARGEABLE IN WORDS : ${numberToIndianWords(inv.grandTotal)}`,x+43,wy+5,w-48,28,{size:7.8});
  const fy=wy+36, fh=132; rect(doc,x+38,fy,w-38,fh); line(doc,x+208,fy,x+208,fy+fh,0.7); line(doc,x+208,fy+70,x+w,fy+70,0.7);
  text(doc,`DECLARATION :\n${COMPANY.declaration}`,x+44,fy+35,156,78,{size:8});
  text(doc,`COMPANY BANK DETAILS :\nBANK NAME        :    ${COMPANY.bankName}\nBRANCH NAME      :    ${COMPANY.branchName}\nACCOUNT NUMBER   :    ${COMPANY.accountNumber}\nACCOUNT TYPE     :    ${COMPANY.accountType}\nIFSC CODE        :    ${COMPANY.ifsc}`,x+213,fy+5,252,62,{size:8});
  text(doc,'AUTHORISED SIGNATURE',x+210,fy+76,250,14,{size:8,align:'center'}); text(doc,'(GNK NAVEEN INDUSTRIAL CATERERS &\nMAINTAINANCE)',x+210,fy+112,250,30,{size:7.5,align:'center'});
}
function drawHousekeeping(doc: PDFKit.PDFDocument, inv: Invoice){
  const logoPath=path.join(process.cwd(),'public','gnk-header.png');
  if(fs.existsSync(logoPath)) doc.image(logoPath,45,20,{width:505,height:113});
  text(doc,'GST TAX INVOICE',L,144,471,14,{bold:true,size:8,align:'center'});
  const x=49,y=154,w=488,left=236,right=w-left; rect(doc,x,y,w,405);
  line(doc,x+left,y,x+left,y+156,0.8); line(doc,x,y+78,x+w,y+78,0.8); line(doc,x,y+156,x+w,y+156,0.8);
  text(doc,`${COMPANY.name.toUpperCase()}\n# ${COMPANY.address[0].replace(',','')}\n${COMPANY.address[1].replace(',','')}\nState Name : Telangana, Code : 36\nGSTIN/UIN : ${COMPANY.gstin}\nPhone no : ${COMPANY.phone}`,x+5,y+5,left-10,70,{size:7.2,bold:true});
  text(doc,`INVOICE NO. ${inv.invoiceNo}\n\nInvoice date : ${dateDMY(inv.invoiceDate)}\nDescription of work : ${inv.workDescription||'Housekeeping and maintenance works'}\nPeriod of work : ${dateRange(inv.periodFrom,inv.periodTo)}`,x+left+5,y+5,right-10,68,{size:7.2});
  text(doc,`Buyer\n${inv.billToName}\n${inv.billToAddress||''}\nGSTIN/UIN        : ${inv.billToGstin||''}\nState Name       : ${inv.billToState||'Telangana, Code : 36'}`,x+5,y+82,left-10,68,{size:7.1});
  text(doc,`BILL Description :\n${inv.billDescription||''}`,x+left+5,y+82,right-10,68,{size:7.1});
  const ty=y+156; const cols=[x,x+42,x+240,x+302,x+356,x+407,x+w]; const hh=22; const visibleItems=inv.lineItems.slice(0,8); const itemArea=Math.max(100, visibleItems.length*28); const tableH=hh+itemArea+80; rect(doc,x,ty,w,tableH); cols.forEach(cx=>line(doc,cx,ty,cx,ty+tableH,0.6));
  ['S.No.','Description of Goods','HSN/SAC','Quantity','Rate','Per','Amount'].forEach((h,i)=>text(doc,h,cols[i]+3,ty+5,cols[i+1]-cols[i]-6,15,{bold:true,size:6.7,align:i===1?'left':'center'})); line(doc,x,ty+hh,x+w,ty+hh,0.6);
  const rowH=itemArea; visibleItems.forEach((it,i)=>{const yy=ty+hh+i*rowH/Math.max(1,visibleItems.length); const rh=rowH/Math.max(1,visibleItems.length); text(doc,String(i+1),cols[0]+3,yy+7,35,rh,{size:6.8}); text(doc,it.description,cols[1]+5,yy+7,cols[2]-cols[1]-10,rh,{size:6.8}); text(doc,it.hsnSac||'998533',cols[2]+3,yy+7,cols[3]-cols[2]-6,rh,{size:6.8,align:'center'}); text(doc,String(it.quantity),cols[3]+3,yy+7,cols[4]-cols[3]-6,rh,{size:6.8,align:'center'}); text(doc,money(it.rate),cols[4]+3,yy+7,cols[5]-cols[4]-6,rh,{size:6.8,align:'center'}); text(doc,it.per||'Quantity',cols[5]+3,yy+7,cols[6]-cols[5]-6,rh,{size:6.8,align:'center'}); text(doc,money(it.quantity*it.rate),cols[6]+3,yy+7,45,rh,{size:6.8,align:'right'}); line(doc,x,yy+rh,x+w,yy+rh,0.4);});
  const sy=ty+hh+itemArea; ['TOTAL',`CGST ${inv.cgstRate}%`,`SGST ${inv.sgstRate}%`,'TOTAL'].forEach((lab,i)=>{const yy=sy+i*20; text(doc,lab,x+240,yy+4,167,13,{size:6.8,align:'right',bold:i===3}); text(doc,money([inv.subtotal,inv.taxCgst,inv.taxSgst,inv.grandTotal][i]),x+407,yy+4,76,13,{size:6.8,align:'right',bold:i===3}); line(doc,x+240,yy,x+w,yy,0.4);});
  const wy=ty+hh+itemArea+80; text(doc,`Amount Chargeable (in words): ${numberToIndianWords(inv.grandTotal)}`,x+5,wy+7,w-10,22,{size:6.8});
  text(doc,`Account Details\nAccount no : ${COMPANY.accountNumber}\nAccount Name : ${COMPANY.name}\nAccount type : ${COMPANY.accountType}\nIFSC Code : ${COMPANY.ifsc}\nBranch Name : ${COMPANY.branchName}`,x+5,wy+34,260,70,{size:6.8});
  rect(doc,x+260,wy+30,228,82,0.6); text(doc,`For ${COMPANY.name}`,x+270,wy+36,208,15,{size:6.8,align:'center'}); text(doc,'Authorised Signatory',x+340,wy+80,130,14,{size:6.8,align:'right'});
}
