import { useField } from "formik";
import React from "react";
import {
  TagPicker,
  IBasePicker,
  ITag,
  IInputProps,
  IBasePickerSuggestionsProps,
  ValidationState,
} from '@fluentui/react/lib/Pickers';
import { Label, Text } from "@fluentui/react";

// const testTags: ITag[] = [
//   'black',
//   'blue',
//   'brown',
//   'cyan',
//   'green',
//   'magenta',
//   'mauve',
//   'orange',
//   'pink',
//   'purple',
//   'red',
//   'rose',
//   'violet',
//   'white',
//   'yellow',
// ].map(item => ({ key: item, name: item }));

//filter: string, selectedItems?: ITag[] | undefined


const listContainsTagList = (tag: ITag, tagList?: ITag[]) => {
  if (!tagList || !tagList.length || tagList.length === 0) {
    return false;
  }
  return tagList.some(compareTag => compareTag.key === tag.key);
};

const getTextFromItem = (item: ITag) => item.name;

const pickerSuggestionsProps: IBasePickerSuggestionsProps = {
  suggestionsHeaderText: 'Suggested tags',
  noResultsFoundText: 'No keywords found. Press enter to add new keyword.',
};

const createGenericItem=(input: string, validationState: ValidationState) => {
  const itag = { key: input, name: input} as ITag;
  return itag;
}

const handleValidateInput = (input: string) => {
   return ValidationState.valid;
}

export function SPPicker(props:any){

  const [field, meta, helpers] = useField(props.name)

  const onItemSelected = (selectedItem?: ITag | undefined) => {
    return selectedItem
  }

  const selectedItems = field.value ? field.value.split(',').map((i:any) => ({key: i, name: i})) : []

  const handleChange = (items?: ITag[] | undefined) => {    
    // const newValue = {
    //   __metadata: {
    //     type: "Collection(Edm.String)"
    //   },
    //   results: items ? items.map(i => i.name) : []
    // }
    const newValue = items ? items.map(i => i.name).join(',') : "";
    helpers.setValue(newValue)   
    if (props.onChange)
      props.onChange(newValue)  
  }

  const filterSuggestedTags = (filter: string, selectedItems?: ITag[] | undefined): ITag[] => {
    let tagList:ITag[] = props.options.map((i:string) => ({key: i, name: i}))
    return filter
      ? tagList.filter(
          tag => tag.name.toLowerCase().indexOf(filter.toLowerCase()) === 0 && !listContainsTagList(tag, selectedItems),
        )
      : [];
  };

  return (    
      <div>
        <Label {...props}>{props.label}</Label> 
        {props.readOnly 
          ?<Text>{field.value}</Text> 
          :<TagPicker
          {...props}
          removeButtonAriaLabel="Remove"
          onResolveSuggestions={filterSuggestedTags}
          getTextFromItem={getTextFromItem}
          pickerSuggestionsProps={pickerSuggestionsProps}          
          onItemSelected={onItemSelected}           
          createGenericItem={createGenericItem} 
          onValidateInput={handleValidateInput}
          onChange={handleChange}
          selectedItems={selectedItems}
        />}
        {/* <pre>value: {meta.value}</pre> */}
      </div>
  )
}