import React, { useState, useEffect } from 'react';
import { Text, Stack, Modal, mergeStyleSets, getTheme, IconButton, FontWeights, IIconProps, DefaultButton, TextField, MessageBar, MessageBarType, Link, Spinner, SpinnerSize } from '@fluentui/react';
import { useId } from '@uifabric/react-hooks';
import { SPDisplayPerson } from './SPDisplayPerson';
import { MultiPersonField, WorkflowStep, SPTask, SPTaskModalFormikValues } from './types';
import { Formik, useField } from 'formik';
import { SPTextField } from './controls/SPTextField';
import { formatISODate } from './SPServices';

declare var _spPageContextInfo: any;

interface SPTaskModalState {
  loadingTaskIndex?: number;
  error?: string
}

interface SPTaskModalProps {  
  isOpen: boolean
  workflowStep?: WorkflowStep,
  tasks: SPTask[]  
  hideModal: any
  onOutcomeClick: (outcome: any, task: SPTask, hideModal: any, workflowStep?: WorkflowStep) => any
}

const taskStyle: React.CSSProperties | undefined = {
  border: "solid 1px grey",
  padding: 10
}

export function SPTaskModal(props:SPTaskModalProps){
  const [state, setState] = useState<SPTaskModalState>({})

  const titleId = useId('title');
  const cancelIcon: IIconProps = { iconName: 'Cancel' };

  // const taskInitialValues = {
  //   ...props.defaultValues.task,
  //   comments: ""
  // }

  const getTasksForStep = () => {
    return props.tasks && props.workflowStep ? props.tasks.filter((i:any) => i.stepKey == props.workflowStep!.name && i.active) : []
  }

  const taskIsEditable = (task: SPTask) => {   
    return !task.completed && task.assignedToId && task.assignedToId.results.indexOf(_spPageContextInfo.userId) > -1
  }  
  
  return <Modal
      titleAriaId={titleId}
      isOpen={props.isOpen}
      //onDismiss={props.hideModal}
      isBlocking={false}
      containerClassName={contentStyles.container}       
    >
      <div className={contentStyles.header}>
        <span id={titleId}>{props.workflowStep && props.workflowStep.name ? props.workflowStep.name : null}</span>
        <IconButton
          styles={iconButtonStyles}
          iconProps={cancelIcon}
          ariaLabel="Close popup modal"
          onClick={props.hideModal}
        />
      </div>
      <div className={contentStyles.body}>
        {props.workflowStep ? <p>{props.workflowStep.description}</p> : null}
        <Stack tokens={{childrenGap: 's1'}}>
          {getTasksForStep().map((task:SPTask, index:number) => <Stack key={index} style={taskStyle} tokens={{childrenGap: 's1'}}>
            {/* <Formik
              onSubmit={() => {}}
              initialValues={{
                task: {
                  ...taskInitialValues,
                  ...task,                  
                },
                form: props.defaultValues.form
              }}
              validationSchema={props.workflowStep ? props.workflowStep.validationSchema : undefined}
            >
            {({values, handleSubmit, isValid, setValues, validateForm}) => <> */}
              <Text variant="large" style={{fontWeight: 600}}>{task.taskName}</Text>              
              {!taskIsEditable(task) 
                ? task.completed 
                  ? <>
                    <Text style={{fontWeight: 600}}>Completed By: <SPDisplayPerson userId={task.completedById}></SPDisplayPerson></Text>
                    <Text style={{fontWeight: 600}}>Completed On: {task.completedDate ? formatISODate(task.completedDate) : ""}</Text>
                    <Text style={{fontWeight: 600}}>Outcome: {task.outcome}</Text>
                    {/* 
                      Display Custome Task form
                      {props.workflowStep && props.workflowStep.showCompletedForm && props.workflowStep.form 
                      ? typeof props.workflowStep.form === 'function'
                        ? props.workflowStep.form(values)
                        : props.workflowStep.form 
                      : null
                    } */}
                    {task.comments ? <><Text style={{fontWeight: 600}}>Comments: </Text><Text>{task.comments}</Text></> : null}
                  </>
                  : <>
                    <Text style={{fontWeight: 600}}>Assigned To</Text>
                    {task.assignedToId ? task.assignedToId.results.map((i:any, index:number) => <SPDisplayPerson key={index} userId={i}></SPDisplayPerson>) : null} 
                  </> 
                : <>
                  <Text style={{fontWeight: 600}}>Assigned To</Text>
                  {task.assignedToId ? task.assignedToId.results.map((i:any, index:number) => <SPDisplayPerson key={index} userId={i}></SPDisplayPerson>) : null}
                  {/* {props.workflowStep && props.workflowStep.form 
                    ? typeof props.workflowStep.form === 'function'
                      ? props.workflowStep.form(values)
                      : props.workflowStep.form 
                    : null
                  } */}
                  {/* <SPTextField name="Tasks[0].Comments" label="Comments" multiline rows={3}></SPTextField>    */}
                  <SPTaskForm task={task}></SPTaskForm>                  
                  {props.workflowStep && props.workflowStep.outcomes ? <Stack horizontal tokens={{childrenGap: 's1'}}>
                  { task.taskIndex != state.loadingTaskIndex 
                    ? props.workflowStep.outcomes.map((outcome:any,index:number) => 
                      <DefaultButton 
                        key={index} 
                        styles={{root: {height: "auto", minHeight: "30px"}}} 
                        text={outcome.name} 
                        // onClick={() => _onOutcomeClick(outcome, handleSubmit, task, isValid, values, setValues, validateForm)}
                        onClick={async () => await _onOutcomeClick(outcome, task)}
                      />
                    ) 
                    : null
                  }
                  </Stack> : null}
                </>
              }  
              {task.taskIndex == state.loadingTaskIndex ? <Spinner size={SpinnerSize.medium} label="Working on it..." ariaLive="assertive" labelPosition="right" /> : null}
              {state.error ? <MessageBar messageBarType={MessageBarType.error}>Error while completing task. <Link onClick={() => {window.alert(state.error)}}>Click here for more information.</Link></MessageBar> : null}                       
            {/* </>}           
            </Formik> */}
          </Stack>)}          
        </Stack>        
      </div>
    </Modal> 

  async function _onOutcomeClick(outcome:any, task:SPTask, ){
    let error = undefined;     
    setState({
      loadingTaskIndex: task.taskIndex
    })
    try{                      
      await props.onOutcomeClick(outcome, task, props.hideModal, props.workflowStep)       
      console.log("I shoudlnt see this b4 the updates.")
    }
    catch(e){
      error = e
      console.error(e)
    }    
    setState({
      loadingTaskIndex: undefined,
      error
    }) 
    // if (outcome.dismissModal && !error)
    //   props.hideModal()
    // let error = undefined; 
    // values = {
    //   ...values,
    //   task:{
    //     ...values.task,
    //     outcome: outcome.name
    //   }
    // }
    // setValues(values, true)    
    // handleSubmit()
    // const errors = await validateForm(values)    
    // if (errors && Object.keys(errors).length === 0 && errors.constructor === Object){
    //   setState({
    //     loadingTaskKey: task.taskKey
    //   })
    //   try{                
    //     await outcome.actions(props.state, props.setState, values, props.workflowStep ? props.workflowStep.name : undefined)        
    //   }
    //   catch(e){
    //     error = e
    //   }
    //   setState({
    //     loadingTaskKey: undefined,
    //     error
    //   }) 
    //   if (outcome.dismissModal && !error)
    //     props.hideModal()
    // }
  }
}



const theme = getTheme();
const contentStyles = mergeStyleSets({
  container: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'stretch',
    width: 600
  },
  header: [
    // eslint-disable-next-line deprecation/deprecation
    theme.fonts.xLargePlus,
    {
      flex: '1 1 auto',
      borderTop: `4px solid ${theme.palette.themePrimary}`,
      color: theme.palette.neutralPrimary,
      display: 'flex',
      alignItems: 'center',
      fontWeight: FontWeights.semibold,
      padding: '12px 12px 14px 24px',
    },
  ],
  body: {
    flex: '4 4 auto',
    padding: '0 24px 24px 24px',
    overflowY: 'hidden',
    selectors: {
      p: { margin: '14px 0' },
      'p:first-child': { marginTop: 0 },
      'p:last-child': { marginBottom: 0 },
    },
  },
});

const iconButtonStyles = {
  root: {
    color: theme.palette.neutralPrimary,
    marginLeft: 'auto',
    marginTop: '4px',
    marginRight: '2px',
  },
  rootHovered: {
    color: theme.palette.neutralDark,
  },
};

const SPTaskForm = ({task}:{task:SPTask}) => {
  const [field, meta, helpers] = useField(`Tasks[${task.taskIndex}].Comments`)
  return <TextField {...field} label="Comments" multiline rows={3}></TextField>               
}