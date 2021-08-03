import * as Yup from 'yup';
import { OptionalArraySchema } from 'yup/lib/array';
import { AnyObject } from 'yup/lib/object';

export interface SharePointList {
  __metadata?: {
    etag?: string
    [key:string]: any
  }
  ID?: number
  Title?: string
  Created?: string
  Modified?: string
  AuthorId?: number
  EditorId?: number
  AttachmentFiles?: SharePointAttachments
  [key:string]: any
}

export interface SharePointAttachments {
  results: SharePointAttachment[]
}

export interface SharePointAttachment{
  __metadata: {
    fileObj : File,
    unsaved? : boolean
    updated? : boolean
    deleted? : boolean
  },
  FileName : string
  ServerRelativeUrl?: string
}


export interface AppModel {
  [key: string] : any
  POCMain: SharePointList
  POCSub: SharePointList[]
}

export interface MultiChoiceField{
  __metadata?: {
        type: "Collection(Edm.String)"
  },
  "results": string[]
}

export interface MultiPersonField{
  __metadata?: {
        type: "Collection(Edm.Int)"
  },
  "results": number[]
}


export interface HyperlinkField{
  __metadata?: {
    type: "SP.FieldUrlValue"
  },
  Description: string,
  Url: string
}

export interface WorkflowStep{
  name: string;
  description?: string;
  actions?: (state: any) => Promise<any>;
  outcomes?: WorkflowStepOutcome[];
  validationSchema?: any;
  condition?: (state: any) => boolean;
  form?: ((values: any) => JSX.Element) | JSX.Element;
  showCompletedForm?: boolean
} 

export interface WorkflowStepOutcome{
  name: string;
  actions: (state: any, setState: any, values: any, stepName?:string) => Promise<any>;
  dismissModal?: boolean
}

export interface SPTask {
  [key:string]: any
  taskName?: string | undefined;
  taskKey?: number | undefined;
  stepKey?: string | undefined;
  assignedToId?: MultiPersonField | undefined;
  completedById?: number | undefined
  completedDate?: string | undefined
  completed?: boolean | undefined;
  outcome?: string | undefined;
  comments: string;
}

export interface SPTaskModalFormikValues{
  task: SPTask,
  form: any
}

export interface SPAppSchema{

}

export interface SPListSchema{
  name: string
  fields: SPFieldSchema[]
  parent?: string  
  primary?: boolean
  defaultItems?: number
  validation?: (values:any, yupArray:OptionalArraySchema<Yup.AnySchema<any, any, any>, AnyObject, any[] | undefined>) => any
}

export interface SPFieldSchema{
  name: string
  label?: string
  required?: boolean
  validation?: (values:any) => any
  defaultValue?: any
  foreignKey?: boolean
  primaryKey?: boolean
}