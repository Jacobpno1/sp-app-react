import { FormikProps } from 'formik';
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
  // actions?: (...args: any[]) => Promise<any>;
  actions?: (...args: any[]) => any;
  // actions?: <Effects>(...args: any[]) => {
  //   values: any,
  //   effects: Effects
  // };
  outcomes?: WorkflowStepOutcome[];
  validationSchema?: any;
  condition?: (state: any) => boolean;
  form?: ((values: any) => JSX.Element) | JSX.Element;
  showCompletedForm?: boolean
} 

export interface WorkflowStepOutcome{
  name: string;
  actions: (...args: any[]) => any;
  dismissModal?: boolean
}

export interface SPTask {
  [key:string]: any
  taskName?: string
  taskKey?: number
  taskIndex: number
  stepKey?: string
  assignedToId?: MultiPersonField
  completedById?: number
  completedDate?: string
  completed?: boolean
  outcome?: string
  comments: string;
  active: boolean
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

export interface SPAppBag {
  formikBag: FormikProps<any>;
  saveApp: (listName?: string | undefined | null, valuesOverride?: any) => Promise<any>
  deleteApp: (listName?: string | undefined) => Promise<void>;
}