import { sp, List, ItemAddResult } from "@pnp/sp";

export const cleanListItem = (item:any) => {
			for (var i in item)	{
				//clean null properties from list
				if(item[i] === null)
					delete item[i];				
				else if(item[i] && item[i].__deferred)
					delete item[i];				
				else if (i.indexOf("StringId") > -1)
					delete item[i];
			}					
			return item;		
}

export async function saveItem(item:any, list: List):Promise<ItemAddResult>{
  const r = (item.ID) ? await list.items.getById(item.ID).update(item) : await list.items.add(item);
  if (r.data.ID)
    item.ID = r.data.ID;
  return r;
}

export function formatISODate(isoDate: string, offset?: number){
  const date = new Date(isoDate)
	const hoursOffset = date.getHours() + (offset ? offset : 0)
  const hours = ((hoursOffset > 12) ? hoursOffset - 12 : hoursOffset) ;
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = (hoursOffset > 12) ? "PM" : "AM";
  return date.toLocaleDateString("en-US") + " " + hours + ":" + minutes + " " + ampm
}
