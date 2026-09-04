import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, AlignmentType, TextRun, VerticalAlign, BorderStyle, ImageRun } from 'docx';
import fs from 'fs';
import path from 'path';
import { COMPANY } from './company';
import { Invoice } from './types';
import { money, dateDMY, dateRange } from './format';
import { numberToIndianWords } from './invoice';

const borders={top:{style:BorderStyle.SINGLE,size:6,color:'000000'},bottom:{style:BorderStyle.SINGLE,size:6,color:'000000'},left:{style:BorderStyle.SINGLE,size:6,color:'000000'},right:{style:BorderStyle.SINGLE,size:6,color:'000000'},insideHorizontal:{style:BorderStyle.SINGLE,size:6,color:'000000'},insideVertical:{style:BorderStyle.SINGLE,size:6,color:'000000'}};
function cell(text:string,w:number,bold=false){return new TableCell({width:{size:w,type:WidthType.DXA},verticalAlign:VerticalAlign.CENTER,children:[new Paragraph({children:[new TextRun({text,bold,size:18})]})]});}
function row(values:string[], widths:number[], bold=false){return new TableRow({children:values.map((v,i)=>cell(v,widths[i],bold))});}

export async function buildInvoiceDocx(inv:Invoice){
  if(inv.invoiceType==='housekeeping') return buildHousekeeping(inv);
  return buildCatering(inv);
}

async function buildCatering(inv:Invoice){
  const widths=[700,2900,1000,1000,800,1200];
  const itemRows=inv.lineItems.map((it,i)=>row([String(i+1),it.description,String(it.quantity),money(it.rate),it.per||'',money(it.quantity*it.rate)],widths));
  const itemTable=new Table({width:{size:7600,type:WidthType.DXA},borders,rows:[row(['SNO','DESCRIPTION','QUANTITY','RATE','PER','AMOUNT IN Rs.'],widths,true),...itemRows]});
  const totals=new Table({width:{size:7600,type:WidthType.DXA},borders,rows:[['TOTAL',money(inv.subtotal)],['CGST '+inv.cgstRate+'%',money(inv.taxCgst)],['SGST '+inv.sgstRate+'%',money(inv.taxSgst)],['GRAND TOTAL',money(inv.grandTotal)]].map(([a,b])=>new TableRow({children:[cell('',700),cell(a,5500,true),cell(b,1400,true)]}))});
  const bottom=new Table({width:{size:7600,type:WidthType.DXA},borders,rows:[new TableRow({children:[cell('DECLARATION :\n'+COMPANY.declaration,2900),cell('COMPANY BANK DETAILS :\nBANK NAME        :    '+COMPANY.bankName+'\nBRANCH NAME      :    '+COMPANY.branchName+'\nACCOUNT NUMBER   :    '+COMPANY.accountNumber+'\nACCOUNT TYPE     :    '+COMPANY.accountType+'\nIFSC CODE        :    '+COMPANY.ifsc,4700)]}),new TableRow({children:[cell('',2900),cell('AUTHORISED SIGNATURE\n\n\n(GNK NAVEEN INDUSTRIAL CATERERS & MAINTAINANCE)',4700,true)]})]});
  const doc=new Document({sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:850,bottom:850,left:1600,right:1600}}},children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:'Taxable Invoice',bold:true,underline:{type:'single'},size:28})]}),new Table({width:{size:7600,type:WidthType.DXA},borders,rows:[new TableRow({children:[cell(`${COMPANY.name}\n${COMPANY.address.join('\n')}\nContact no : ${COMPANY.phone}\nGST IN : ${COMPANY.gstin}\nH/K code : ${COMPANY.hkCode}\nSAC CODE : ${COMPANY.sacCode}`,3500),cell(`INVOICE No : ${inv.invoiceNo}\nINVOICE DATE: ${dateDMY(inv.invoiceDate)}`,4100)]}),new TableRow({children:[cell('BILL TO\n'+inv.billToName+'\n'+(inv.billToAddress||'')+'\nGST NO : '+(inv.billToGstin||''),3500),cell('Description: '+(inv.billDescription||''),4100)]})]}),itemTable,totals,new Paragraph({children:[new TextRun({text:'AMOUNT CHARGEABLE IN WORDS : '+numberToIndianWords(inv.grandTotal),size:18})]}),bottom]}]});
  return Packer.toBuffer(doc);
}

async function buildHousekeeping(inv:Invoice){
  const logoPath=path.join(process.cwd(),'public','gnk-header.png');
  const children:any[]=[];
  if(fs.existsSync(logoPath)) children.push(new Paragraph({alignment:AlignmentType.CENTER,children:[new ImageRun({data:fs.readFileSync(logoPath),transformation:{width:500,height:112},type:'png'})]}));
  children.push(new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:'GST TAX INVOICE',bold:true,size:18})]}));
  const infoWidths=[3800,3800];
  children.push(new Table({width:{size:7600,type:WidthType.DXA},borders,rows:[new TableRow({children:[cell(`${COMPANY.name}\n# 19-1-912/2\nMurali nagar, Bahadurpura\nHyderabad – 500 064.\nState Name : Telangana, Code : 36\nGSTIN/UIN : ${COMPANY.gstin}\nPhone no : ${COMPANY.phone}`,3800,true),cell(`INVOICE NO. ${inv.invoiceNo}\n\nInvoice date : ${dateDMY(inv.invoiceDate)}\nDescription of work : ${inv.workDescription||''}\nPeriod of work : ${dateRange(inv.periodFrom,inv.periodTo)}`,3800)]}),new TableRow({children:[cell(`Buyer\n${inv.billToName}\n${inv.billToAddress||''}\nGSTIN/UIN : ${inv.billToGstin||''}\nState Name : ${inv.billToState||''}`,3800),cell(`BILL Description :\n${inv.billDescription||''}`,3800)]})]}));
  const widths=[600,2600,800,800,800,700,1300];
  children.push(new Table({width:{size:7600,type:WidthType.DXA},borders,rows:[row(['S.No.','Description of Goods','HSN/SAC','Quantity','Rate','Per','Amount'],widths,true),...inv.lineItems.map((it,i)=>row([String(i+1),it.description,it.hsnSac||'998533',String(it.quantity),money(it.rate),it.per||'Quantity',money(it.quantity*it.rate)],widths))]}));
  children.push(new Table({width:{size:7600,type:WidthType.DXA},borders,rows:[['TOTAL',money(inv.subtotal)],['CGST '+inv.cgstRate+'%',money(inv.taxCgst)],['SGST '+inv.sgstRate+'%',money(inv.taxSgst)],['TOTAL',money(inv.grandTotal)]].map(([a,b])=>new TableRow({children:[cell('',600),cell(a,5700,true),cell(b,1300,true)]}))}));
  children.push(new Paragraph({children:[new TextRun({text:'Amount Chargeable (in words): '+numberToIndianWords(inv.grandTotal),size:16})]}));
  children.push(new Table({width:{size:7600,type:WidthType.DXA},borders,rows:[new TableRow({children:[cell(`Account Details\nAccount no : ${COMPANY.accountNumber}\nAccount Name : ${COMPANY.name}\nAccount type : ${COMPANY.accountType}\nIFSC Code : ${COMPANY.ifsc}\nBranch Name : ${COMPANY.branchName}`,3800),cell(`For ${COMPANY.name}\n\n\nAuthorised Signatory`,3800,true)]})]}));
  const doc=new Document({sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:500,bottom:500,left:800,right:800}}},children}]});
  return Packer.toBuffer(doc);
}
