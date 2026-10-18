"use client";
import {useState} from "react";
import {Card,CardHeader,CardTitle,DataList,CopyableValue,Field} from "@/core/ui";
import {copy} from "../copy";
import {formatReport} from "../lib/format";
import type {Report,Label} from "../types";
export function StrkeyInspectorResult({result}:{result:Report}){
 const [filter,setFilter]=useState("");const rows=result.rows?.filter(row=>!filter||row.kind===filter);
 const items=(values:Report["values"])=>Object.entries(values).map(([key,value])=>({label:copy.labels[key as Label],value:<CopyableValue label={copy.labels[key as Label]} value={value} full/>}));
 return <Card><CardHeader><CardTitle>{copy.resultTitle}</CardTitle></CardHeader><DataList items={items(result.values)}/>
 {result.rows && <><Field label={copy.filter}>{({inputId})=><select id={inputId} value={filter} onChange={e=>setFilter(e.target.value)}><option value="">{copy.all}</option>{Array.from(new Set(result.rows?.map(row=>row.kind))).map(kind=><option key={kind}>{kind}</option>)}</select>}</Field>
 {rows?.length ? rows.map(row=><div key={row.id} className="border-t py-3"><DataList items={items(row.values)}/></div>) : <p role="status">{copy.noRows}</p>}</>}
 <CopyableValue label={copy.report} value={formatReport(result)}/>
 </Card>;
}
