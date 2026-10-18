"use client";
import {useState} from "react";
import {Field,Input,Button} from "@/core/ui";
import {copy} from "../copy";
import type {RawInput} from "../types";
const defaults:RawInput={"mode": "Decimal", "decimal": "", "numerator": "", "denominator": "", "precision": "7"};
const secretFields:string[]=[];
export function PriceFractionLabForm({onSubmit,onEdit,pending}:{onSubmit:(raw:RawInput)=>void;onEdit:()=>void;pending:boolean}){
 const [values,setValues]=useState<RawInput>(defaults);const [rejected,setRejected]=useState(false);
 function change(key:string,value:string){
  onEdit();
  if(secretFields.includes(key) && /^S/i.test(value.trim())){setValues(v=>({...v,[key]:""}));setRejected(true);return;}
  setRejected(false);setValues(v=>({...v,[key]:value}));
 }
 return <form className="space-y-4" onSubmit={e=>{e.preventDefault();onSubmit(values);}}>
 {Object.entries(copy.fields).map(([key,spec])=><Field key={key} label={spec.label} hint={spec.hint}>{({inputId,describedBy})=>{
 const field=spec as {label:string;hint:string;options?:readonly string[];multiline?:boolean};
 return field.options ? <select id={inputId} aria-describedby={describedBy} value={values[key]} onChange={e=>change(key,e.target.value)} className="w-full rounded border p-2">{field.options.map(option=><option key={option} value={option}>{option}</option>)}</select> : field.multiline ? <textarea id={inputId} aria-describedby={describedBy} value={values[key]} onChange={e=>change(key,e.target.value)} autoComplete="off" spellCheck={false} rows={5} className="w-full rounded border p-2 font-mono"/> : <Input id={inputId} aria-describedby={describedBy} value={values[key]} onChange={e=>change(key,e.target.value)} autoComplete="off" spellCheck={false}/>;
 }}</Field>)}
 {rejected && <p role="alert">{copy.rejected}</p>}
 <Button type="submit" disabled={pending}>{pending?copy.loading:copy.submit}</Button>
 <Button type="button" variant="secondary" onClick={()=>{setValues(defaults);setRejected(false);onEdit();}}>{copy.reset}</Button></form>;
}
