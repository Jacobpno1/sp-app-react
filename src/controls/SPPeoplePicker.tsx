import React, { useState, useEffect, useContext } from 'react';
import { NormalPeoplePicker, IPersonaProps, IBasePickerSuggestionsProps, Label, IBasePickerStyles, Stack } from '@fluentui/react';
import { useField, useFormikContext } from 'formik';
import _ from 'lodash'
import { SPListContext } from '../SPList';
import { SPDisplayPerson } from '../SPDisplayPerson';
import { errorMessage } from '../styles';
import { useSPField } from '../hooks/useSPField';
declare var _spPageContextInfo: any;

type SPPeoplePickerProps ={
  name: string
  label?: string | undefined
  multiple?: boolean
  required?: boolean
  disabled?: boolean | undefined
  readOnly?: boolean | undefined
  onChange?: ((value?: SPPickerFieldValue | number) => void) | undefined
}

type SPPickerFieldValue = {
  __metadata: {
        type: string
      },
      results: number[]
}

interface SPPickerPersonaProps extends IPersonaProps {
  key?: string
  Id? : number
}


//if (location.hostname === "localhost" || location.hostname === "127.0.0.1")

const header: any = {  
  'Accept' : 'application/json;odata=verbose',    
  'Content-Type' : 'application/json',
  'X-RequestDigest' : location.hostname === "localhost" ? null : (document.getElementById('__REQUESTDIGEST') as HTMLInputElement)!.value
};

const suggestionProps: IBasePickerSuggestionsProps = {
  suggestionsHeaderText: 'Suggested People',
  mostRecentlyUsedHeaderText: 'Suggested Contacts',
  noResultsFoundText: 'No results found',
  loadingText: 'Loading',
  showRemoveButtons: true,
  suggestionsAvailableAlertText: 'People Picker Suggestions available',
  suggestionsContainerAriaLabel: 'Suggested contacts'
};

export const SPPeoplePicker: React.FC<SPPeoplePickerProps> = ({name, label, multiple, required, disabled, readOnly, onChange}) => {
  // const listContext = useContext(SPListContext);
  // const listProps = (listContext && listContext.getFieldProps && name) ? listContext.getFieldProps(name.replace("Id","")) : {}
  
  const defaultSelectedPersonsa: SPPickerPersonaProps[] = [];
  const [selectedPersonas, setSelectedPersonas] = useState(defaultSelectedPersonsa);

  const [field, meta, helpers, spProps] = useSPField({name});    
  if (spProps && spProps.label)
    label = spProps.label
  //const [field, meta, helpers] = useField(name);  
  
  useEffect(() => {
    let newSelectedPersonas = [...selectedPersonas];  
    if (((field.value && typeof(field.value) == "number") || (field.value && field.value.results && field.value.results.length > 0)) && selectedPersonas.length === 0){
      const users = field.value.results || [field.value]
      Promise.all(users.map((i:number) => {
        if (newSelectedPersonas.map(p => {return p.Id}).indexOf(i) == -1)
          return fetch(`${_spPageContextInfo.webAbsoluteUrl}/_api/web/getuserbyid(${i})`, {
            method: "GET",
            headers: header
          })
          .then((response: any) => {
            return response.json();
          })
          .then(r => {
            let persona: SPPickerPersonaProps = {
              text: r.d.Title,
              secondaryText: "",
              key: r.d.LoginName,
              Id: i
            };
            newSelectedPersonas.push(persona)                    
          })
      }))
      .then(() => {
        setSelectedPersonas(newSelectedPersonas)
      });            
    }
  }, [field.value]);

  const _onFilterChanged= (filterText: string): IPersonaProps[] | Promise<IPersonaProps[]> => {
    if (filterText && filterText.length > 2) {
      return _SearchUsers(filterText);
    } else
      return []
  };

  const _SearchUsers= (filterText: string) : Promise<SPPickerPersonaProps[]> => {    
    const body: any = { 
      "queryParams": { 
        "QueryString": filterText, 
        "MaximumEntitySuggestions": 50, 
        "AllowEmailAddresses": false, 
        "AllowOnlyEmailAddresses": false, 
        "PrincipalType": 1, 
        "PrincipalSource": 15, 
        "SharePointGroupID": 0 
      } 
    }
    return fetch(_spPageContextInfo.webAbsoluteUrl + "/_api/SP.UI.ApplicationPages.ClientPeoplePickerWebServiceInterface.ClientPeoplePickerSearchUser", {
      method: "POST",
      body: JSON.stringify(body),
      headers: header
    })
    .then((response: any) => {
      return response.json();
    })
    .then((response: any) => {      
      const results: [] = JSON.parse(response.d.ClientPeoplePickerSearchUser);
      let personas: SPPickerPersonaProps[] = results.map((item: any) => {
        let persona: SPPickerPersonaProps = {
          text: item.DisplayText,
          secondaryText: item.EntityData.Title,
          key: item.Key
        };
        return persona;
      });      
      return personas.filter((p:SPPickerPersonaProps) => {
        return selectedPersonas.map(i => {
          return i.key;
        }).indexOf(p.key) == -1;
      });
    })
    .catch(error => {
      console.error(error);
      return [];
    });
  }
  const _onChange = (items:any[]|undefined):void => {    
    const { setValue } = helpers;
    let value: number | SPPickerFieldValue | null= multiple ? {
      "__metadata": {
        "type": "Collection(Edm.Int32)"
      },
      "results": []
    } : null;    
    if (items)
      Promise.all(items.map(item =>{
        if (item.key && !item.Id)
          return _ensureUser(item.key)
          .then((id) => {
            item.Id = id;
          });        
      }))
      .then(() => {
        // value.results = multiple ? items.map(item => {
        //   return item.Id ? item.Id : 0
        // }) : items[0].Id 
        const value =  multiple ? {
          "__metadata": {
            "type": "Collection(Edm.Int32)"
          },
          "results": items.map(item => {
            return item.Id ? item.Id : 0
          })
        } : (items[0]) ? items[0].Id : null
        setValue(value);        
        setSelectedPersonas(items);        
        if (onChange) onChange(value)
      })    
  }

  const _ensureUser = (logonName: string) : Promise<number> => {
    return fetch(`${_spPageContextInfo.webAbsoluteUrl}/_api/web/ensureuser('${encodeURIComponent(logonName)}')`, {
      method: "POST",      
      headers: header
    })
    .then((r: any) => {
      return r.json();
    })
    .then((r: any) => {
      return r.d.Id;
    })
  }
  
  const pickerErrorStyles: Partial<IBasePickerStyles> = {    
    text: {      
      borderColor: "rgb(164, 38, 44)"      
    }        
  }

  const pickerStyles: Partial<IBasePickerStyles> = {    
    text: {      
      borderColor: "rgb(50, 49, 48)"      
    }        
  }
  
  const error:any = meta.error;

  return (readOnly
    ? <div>
      <Label>{spProps ? spProps.label : name}</Label>
      {multiple 
        ? <Stack>
          {field.value.results.map((i:number) => <SPDisplayPerson userId={i}></SPDisplayPerson>)}
        </Stack>
        : <SPDisplayPerson userId={field.value}></SPDisplayPerson>
      }
    </div>
    :<div>
      <Label required={required} disabled={disabled}>{label}</Label>      
      <NormalPeoplePicker        
        onResolveSuggestions={_onFilterChanged}
        disabled={disabled}
        //onEmptyInputFocus={this._returnMostRecentlyUsed}
        //getTextFromItem={(persona: IPersonaProps) => persona.text ? persona.text : ""}
        getTextFromItem={(persona: IPersonaProps) => persona.text ? "zubdub" : ""}
        pickerSuggestionsProps={suggestionProps}
        className={'ms-PeoplePicker'}
        key={'normal'}
        onChange={_onChange}   
        selectedItems={selectedPersonas}
        itemLimit={(multiple) ? undefined : 1}   
        styles={(meta.touched && meta.error) ? pickerErrorStyles : disabled ? undefined : pickerStyles}
        //defaultSelectedItems={selectedPersonas}
        // onRemoveSuggestion={this._onRemoveSuggestion}
        // onValidateInput={this._validateInput}
        // removeButtonAriaLabel={'Remove'}
        inputProps={{
          onBlur: () => helpers.setTouched(true),
          //name: name,
          //onFocus: (ev: React.FocusEvent<HTMLInputElement>) => helpers.setTouched(true),
          'aria-label': 'People Picker'
        }}        
        // onInputChange={this._onInputChange}
        // resolveDelay={300}
        // disabled={this.state.isPickerDisabled}
      />      
      {/* <pre>{JSON.stringify(meta,null,2)}</pre> */}
      {(meta.touched && meta.error) ? (
        <span id="TextFieldDescription2">
          <div role="alert">
            <div className="ms-TextField-errorMessage" style={errorMessage}>
              <span data-automation-id="error-message">{error && error.results ? error.results : error}</span>
            </div>
          </div>
        </span>
        ) : null
      }
      {/* <pre>name: {name}</pre>
      <pre>touched: {meta.touched ? "yes" : "no" }</pre>
      <pre>error: {meta.error}</pre>
      <pre>value: {meta.value}</pre> */}
    </div>
  );
}
