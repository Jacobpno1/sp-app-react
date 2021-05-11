import React from 'react';
import { DatePicker, IDatePickerStrings, mergeStyleSets, DayOfWeek, Button, IconButton, Stack, FontWeights, ActionButton, Text } from '@fluentui/react';
import { useField } from 'formik';
import { SharePointAttachment, SharePointAttachments } from './types';

export const SPLibraryUpload = (props: any)  => {
  const [field, meta, helpers] = useField(props.name);
  const error : string | undefined = meta.touched && meta.error && typeof(meta.error) == 'string' ? meta.error : undefined;
  
  function _onChange(event: React.ChangeEvent<HTMLInputElement>){    
    const { setValue } = helpers;
    const value: any = (field.value) ? field.value : [];     
    event.target.files && Array.prototype.forEach.call(event.target.files, (file:File) => {
      if (!(file.name.match('[\~\#\%\&\*\{\}\\\:\<\>\?\/\+\|]')) && (file.name.substr(0, file.name.lastIndexOf('.')).slice(-1) != '.')){
        const spAttachment:SharePointAttachment = {
          __metadata: {
            fileObj: file,
            unsaved: true
          },
          FileName: file.name
        }
        const index = value.map((i:any) => {return i.FileName}).indexOf(file.name);
        if (index > -1){
          value[index].__metadata.fileObj = file;
          if (!value[index].__metadata.unsaved)
            value[index].__metadata.updated = true;
        }
        else
          value.push(spAttachment)
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
    const value: any = (field.value) ? field.value : []; 
    const index = value.indexOf(item);
    if (item.__metadata.unsaved)
      value.splice(index,1)
    else
      value[index].__metadata.deleted = true;
    setValue(value);    
  }

  function _onClick(){
    const fileInput = document.getElementById("AttachmentUpload-" + name)
    if (fileInput)
      fileInput.click()
  }

  return(
    <Stack>
      <Text variant="large" styles={{root: { fontWeight: FontWeights.semibold }}}>
        Upload Document
      </Text>
      <input type="file" style={{display:"none"}} onChange={_onChange} id={"AttachmentUpload-" + name} title="Name" multiple></input>                
      {field.value && field.value
        .filter((i:SharePointAttachment) => { return !i.__metadata.deleted && i.__metadata.unsaved })
        .map((i:SharePointAttachment, index:number) => {
        return ( 
          <Stack horizontal verticalAlign="center" key={index}>
            <img width="16" height="16" style={{marginRight:5}} title={i.FileName} alt={i.FileName.split('.').pop() + " File"} src={"/_layouts/15/images/ic" + i.FileName.split('.').pop() + ".png"}/>
            {(i.ServerRelativeUrl) ? <a className={'ms-fontWeight-regular'} href={i.ServerRelativeUrl}><Text>{i.FileName}</Text></a> : <Text>{i.FileName}</Text>}            
            <IconButton iconProps={{ iconName: 'Delete' }} title="Delete" ariaLabel="Delete" onClick={() => _delete(i)} />
          </Stack>
        )
      })}
      <ActionButton iconProps={{ iconName: 'Add' }} text="Add Documents" onClick={_onClick} />
      {(meta.touched && meta.error) ? (
        <span id="TextFieldDescription2">
          <div role="alert">
            <div className="ms-TextField-errorMessage errorMessage">
              <span data-automation-id="error-message">{error}</span>
            </div>
          </div>
        </span>
        ) : null
      }
      {/* <pre>{field.value && JSON.stringify(field.value.filter((i:SharePointAttachment) => { return !i.__metadata.deleted }), null, 2)}</pre> */}
    </Stack>
  )
}