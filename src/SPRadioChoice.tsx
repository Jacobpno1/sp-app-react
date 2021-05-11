import { ITextFieldProps, TextField, Dropdown, IDropdownOption, IDropdownStyles, DropdownMenuItemType, ChoiceGroup } from "@fluentui/react";
import { useField } from "formik";
import React from "react";

const dropdownStyles: Partial<IDropdownStyles> = {
  dropdown: { width: 300 },
};

export function SPRadioChoice(props:any){
  const [field, meta, helpers] = useField(props.name);
  const error : string | undefined = meta.touched && meta.error && typeof(meta.error) == 'string' ? meta.error : undefined;

  const _onDismiss = () => {
    helpers.setTouched(true);
  }

  const _onChange = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption | undefined, index?: number | undefined) => {
    helpers.setValue(option ? option.text : null)
  }

  return (
      <div>
        <ChoiceGroup onDismiss={_onDismiss} onChange={_onChange} selectedKey={field.value} {...props} placeholder="Select an option" styles={dropdownStyles}/>
        {(meta.touched && meta.error) ? (
        <span id="TextFieldDescription2">
          <div role="alert">
            <p className="ms-TextField-errorMessage errorMessage-100">
              <span data-automation-id="error-message">{error}</span>
            </p>
          </div>
        </span>
        ) : null
      }
      </div>
  )
}