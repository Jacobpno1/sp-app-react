import React, { useContext } from 'react';
import { Text, DatePicker, IDatePickerStrings, mergeStyleSets, DayOfWeek, Dropdown, IDropdownOption, Stack, Label } from '@fluentui/react';
import { useField, useFormikContext } from 'formik';
import { SPListContext } from '../SPList';
import { SPDisplayDate } from '../SPDisplayDate';
import { useSPField } from '../hooks/useSPField';
//import { props } from 'bluebird';

interface SPDateFieldProps {
  label?: string | undefined,
  name: string,
  required?: boolean|undefined,
  disabled?: boolean | undefined,
  onSelectDate?: ((date: Date | null | undefined) => void) | undefined,
  showTime?: boolean
  minDate?: Date
  maxDate?: Date
  readOnly?: boolean
}

export const SPDateField = ({ label, name, required, disabled, onSelectDate, showTime, minDate, maxDate, readOnly } : SPDateFieldProps)  => {
  const [field, meta, helpers, spProps] = useSPField({name});  
  // const listContext = useContext(SPListContext);
  // const listProps = (listContext && listContext.getFieldProps && name) ? listContext.getFieldProps(name) : {}
  if (spProps && spProps.label)
    label = spProps.label
  // const [field, meta, helpers] = useField(name);
  const error : string | undefined = meta.touched && meta.error && typeof(meta.error) == 'string' ? meta.error : undefined;
  const controlClass = mergeStyleSets({
    control: {
      margin: '0 0 15px 0',
      maxWidth: '300px'
    }
  });
  const DayPickerStrings: IDatePickerStrings = {
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    shortDays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    goToToday: 'Go to today',
    prevMonthAriaLabel: 'Go to previous month',
    nextMonthAriaLabel: 'Go to next month',
    prevYearAriaLabel: 'Go to previous year',
    nextYearAriaLabel: 'Go to next year',
    closeButtonAriaLabel: 'Close date picker',
    isRequiredErrorMessage: error,
    invalidInputErrorMessage: 'Invalid date format.'
  };

  const _onSelectDate = (date: Date | null | undefined) => {
    if (date){
      let dateStr = date.toISOString()
      setTimeout(() => {helpers.setValue(dateStr)});
    }
    if (onSelectDate)
      onSelectDate(date)
    // setTimeout(() => {
    //   helpers.setValue("test");
    // })
    //formikContext.setFieldValue(name, "test")
  }

  const _onBlur = () => {
    helpers.setTouched(true)
  }

  const onHourChange = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption | undefined, index?: number | undefined): void => {
    if(option && typeof option.key == "number"){
      const value = new Date(new Date(field.value).setHours(option.key))
      helpers.setValue(value.toISOString())
    }
  };

  const onMinuteChange = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption | undefined, index?: number | undefined): void => {
    if(option && typeof option.key == "number"){
      const value = new Date(new Date(field.value).setMinutes(option.key))
      helpers.setValue(value.toISOString())
    }
  };

  return(<>
    { readOnly 
        ? <div>
          <Label>{label}</Label>
          <Text>{field.value ? <SPDisplayDate isoDate={field.value} showTime={showTime}></SPDisplayDate> : null}</Text>        
        </div>
        : <Stack horizontal verticalAlign="end">
        <DatePicker
        label={label}
        disabled={disabled}
        minDate={minDate}
        maxDate={maxDate}
        className={controlClass.control}
        firstDayOfWeek={DayOfWeek.Sunday}
        strings={DayPickerStrings}
        placeholder="Select a date..."
        ariaLabel="Select a date"
        showMonthPickerAsOverlay={true}
        onSelectDate={_onSelectDate}
        isRequired={required}
        value={(field.value) ? new Date(field.value) : undefined}
        textField={{
        errorMessage: error,         
        //name: field.name
        }}
        onAfterMenuDismiss={_onBlur}
        />
        {showTime && field.value ? <>
          <Dropdown
            options={hourOptions}
            onChange={onHourChange}
            selectedKey={new Date(field.value).getHours()}
            style={{marginBottom: error ? 36 : 15}}
          />
          <Dropdown
            options={minuteOptions}
            onChange={onMinuteChange}
            selectedKey={new Date(field.value).getMinutes()}
            style={{marginBottom: error ? 36 : 15}}
          />
        </>: null}
        {/* <input {...field}></input>*/}
        {/* <button type="button" onClick={() => {_onSelectDate(undefined)}}>set value</button>  */}
        {/* <pre>value: {meta.value}</pre>
        <pre>error: {meta.error}</pre>
        <pre>touched: {meta.touched ? 'yes' : 'no'}</pre> */}
      </Stack>
    }    
  </>)
}

const hourOptions: IDropdownOption[] = [
  { key: 0, text: '12 AM'},
  { key: 1, text: '1 AM' },
  { key: 2, text: '2 AM' },
  { key: 3, text: '3 AM' },
  { key: 4, text: '4 AM' },
  { key: 5, text: '5 AM' },
  { key: 6, text: '6 AM' },
  { key: 7, text: '7 AM' },
  { key: 8, text: '8 AM' },
  { key: 9, text: '9 AM' },
  { key: 10, text: '10 AM' },
  { key: 11, text: '11 AM' },
  { key: 12, text: '12 PM' },
  { key: 13, text: '1 PM' },
  { key: 14, text: '2 PM' },
  { key: 15, text: '3 PM' },
  { key: 16, text: '4 PM' },
  { key: 17, text: '5 PM' },
  { key: 18, text: '6 PM' },
  { key: 19, text: '7 PM' },
  { key: 20, text: '8 PM' },
  { key: 21, text: '9 PM' },
  { key: 22, text: '10 PM' },
  { key: 23, text: '11 PM' }
]

const minuteOptions: IDropdownOption[] = [
  { key: 0, text: '00' },
  { key: 15, text: '15' },
  { key: 30, text: '30' },
  { key: 45, text: '45' },
]