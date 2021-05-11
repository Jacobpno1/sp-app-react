import React, { useContext } from 'react';
import { DatePicker, IDatePickerStrings, mergeStyleSets, DayOfWeek, Button, IconButton, Stack, FontWeights, ActionButton, Text } from '@fluentui/react';
import { useField } from 'formik';
import { SharePointAttachment, SharePointAttachments } from './types';
import { SPListContext } from './SPList';

interface SPAttachmentsProps {
  list?: string,
  readOnly?: boolean | undefined
  label?: string
  required?: boolean
}

export const SPAttachments = ({list, readOnly, label, required}: SPAttachmentsProps)  => {
  const listContext = useContext(SPListContext);  
  list = listContext ? listContext.listName : list
  const [field, meta, helpers] = useField("AttachmentFiles");
  const error : any = meta.error;
  
  function _onChange(event: React.ChangeEvent<HTMLInputElement>){    
    const { setValue } = helpers;
    const value: SharePointAttachments = (field.value) ? field.value : {results:[]};     
    event.target.files && Array.prototype.forEach.call(event.target.files, (file:File) => {
      if (!(file.name.match('[\~\#\%\&\*\{\}\\\:\<\>\?\/\+\|]')) && (file.name.substr(0, file.name.lastIndexOf('.')).slice(-1) != '.')){
        const spAttachment:SharePointAttachment = {
          __metadata: {
            fileObj: file,
            unsaved: true
          },
          FileName: file.name
        }
        const index = value.results.map(i => {return i.FileName}).indexOf(file.name);
        if (index > -1){
          value.results[index].__metadata.fileObj = file;
          if (!value.results[index].__metadata.unsaved)
            value.results[index].__metadata.updated = true;
        }
        else
          value.results.push(spAttachment)
        setValue(value)
      } 
      else 
        alert("File " + file.name + " contains invalid characters (~ # % & * { } : \\ < > ? + |) or ends with a period and cannot be uploaded. Please remove these character from the file name and upload again.")
    })
    event.target.value = '';
    if(!/safari/i.test(navigator.userAgent)){
        event.target.type = ''
        event.target.type = 'file'
    }
    //   if (event.target.files && typeOf(event.target.files) === array ){
    //       const files = event.target.files.map(i => {return i});
    //   }          
    //   const fileInput:HTMLElement | null = document.getElementById('AttachmentUpload-' + name);
    //   fileInput.files
  }  

  function _delete(item:SharePointAttachment){    
    const { setValue } = helpers;    
    const value: SharePointAttachments = (field.value) ? field.value : {results:[]}; 
    const index = value.results.indexOf(item);
    if (item.__metadata.unsaved)
      value.results.splice(index,1)
    else
      value.results[index].__metadata.deleted = true;
    setValue(value);    
  }

  function _onClick(){
    const fileInput = document.getElementById("AttachmentUpload-" + name)
    if (fileInput)
      fileInput.click()
  }

  const getFilteredList = () => {
    return field.value.results.filter((i:SharePointAttachment) => { return !i.__metadata.deleted })
  }

  return(list 
    ? <Stack>
      <Text variant="large" styles={{root: { fontWeight: FontWeights.semibold }}}>
        {label ? label : "Attachments"}{required && !readOnly ? <span style={{color: "red", marginLeft:5}}>*</span> : null}
      </Text>
      <input type="file" style={{display:"none"}} onChange={_onChange} id={"AttachmentUpload-" + name} title="Name" multiple></input>                
      {field.value && field.value.results && getFilteredList().length > 0 
        //.filter((i:SharePointAttachment) => { return !i.__metadata.deleted })
        ? getFilteredList().map((i:SharePointAttachment, index:number) => {
          return ( 
            <Stack horizontal verticalAlign="center" key={index} tokens={{childrenGap: "s1"}}>
              <img width="16" height="16" title={i.FileName} alt={i.FileName.split('.').pop() + " File"} src={"/_layouts/15/images/ic" + i.FileName.split('.').pop() + ".png"}/>
              <Text>{(i.ServerRelativeUrl) ? <a style={{textDecoration: "none"}} className={'ms-fontWeight-regular'} href={i.ServerRelativeUrl}>{i.FileName}</a> : i.FileName}</Text>
              {readOnly ? null : <IconButton iconProps={{ iconName: 'Delete' }} title="Delete" ariaLabel="Delete" onClick={() => _delete(i)} /> }
            </Stack>
          )
        })
        : <Text>No {label ? label : "attachments"} uploaded.</Text>
      }
      {readOnly ? null : <ActionButton iconProps={{ iconName: 'Add' }} text={label ? "Add " + label : "Add Attachment"} onClick={_onClick} /> }
      {(meta.touched && meta.error && error) ? (
        <span id="TextFieldDescription2">
          <div role="alert">
            <div className="ms-TextField-errorMessage errorMessage">
              <span data-automation-id="error-message">{error.results ? error.results : error}</span>
            </div>
          </div>
        </span>
        ) : null
      }
    </Stack> 
    : <div>
      Cannot display attachments component. Please provide a list name or wrap with a list component.
    </div>
  )
}