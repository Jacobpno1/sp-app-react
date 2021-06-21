import React, { CSSProperties } from 'react';
import { Stack, DefaultEffects, Text, Icon } from '@fluentui/react';
import Radium from 'radium';


export function SPWorkflowSteps(props:any){

  const stepStyle:React.CSSProperties = {    
    boxShadow: DefaultEffects.elevation8,        
  }

  const getActiveSteps = () => {
    return props.workflowSteps.filter((i:any) => i.condition ? i.condition(props.state) : true)
  }

  const isStepBeforeCurrentStep = (stepName: string) => {
    const stepNames = props.workflowSteps.map((i:any) => i.name)
    const currentStepIndex = stepNames.indexOf(props.currentStep)
    return stepNames.indexOf(stepName) < currentStepIndex
  }

  const isStepAfterCurrentStep = (stepName: string) => {
    const stepNames = props.workflowSteps.map((i:any) => i.name)
    const currentStepIndex = stepNames.indexOf(props.currentStep)
    return stepNames.indexOf(stepName) > currentStepIndex
  }

  return <>
    <Stack horizontal className="step-ctr">      
      {getActiveSteps().map((i:any, index:number) => 
        <SPWorkflowStep key={index} item={i} index={index} isStepBeforeCurrentStep={isStepBeforeCurrentStep} getActiveSteps={getActiveSteps} parentProps={props}></SPWorkflowStep>
        // <Stack key={index} horizontal verticalAlign="center">
        //   <Stack style={i.name == props.currentStep ? styles.workflowStep : {...styles.workflowStep, ...styles.activeStep}} onClick={() => props.onClick(i)} horizontal verticalAlign="center">
        //     <Text style={{fontWeight: 600, color: i.name == props.currentStep ? "white" : "auto"}}>
        //       {i.name}
                                  
        //       {/* {isStepAfterCurrentStep(i.name) ? "+" : null}         */}
        //     </Text>
        //     {i.name == props.currentStepAssigned ? <Icon iconName="Error" style={{marginLeft:10}}></Icon> : null}
        //     {i.name == props.currentStep && props.currentStepRejected ? <Icon iconName="ErrorBadge" style={{marginLeft:10}}></Icon> : null}
        //     {isStepBeforeCurrentStep(i.name) ? <Icon iconName="Accept" style={{color: "green", fontWeight: 600, marginLeft:10}}></Icon> : null}
        //   </Stack>
        //   {index+1 != getActiveSteps().length ? <Icon iconName="ChevronRight"></Icon> : null}
        // </Stack> 
      )}      
    </Stack>
  </>
}

const SPWorkflowStep = Radium((props:any) => {
  const {item, index, isStepBeforeCurrentStep, getActiveSteps, parentProps} = props
  const styles = {
    workflowStep: {
      boxShadow: DefaultEffects.elevation8,
      color: "#605e5c",    
      backgroundColor: "#ffffff",        
      margin: "10px",
      padding: "15px",
      cursor: "pointer",
      maxWidth: "300px",
      transitionProperty: "background, border, border-color",
      transitionDuration: "200ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.23, 1)",
      ":hover": {
        backgroundColor: "#f3f2f1"        
      }
    } as Radium.StyleRules,
    activeStep: {
      color: "white",
      backgroundColor: "#0078d4",
      ":hover": {
        backgroundColor: "#106ebe"
      }
    } as Radium.StyleRules  
  }

  return <>
    <Stack key={index} horizontal verticalAlign="center">
        <Stack 
          //style={item.name == parentProps.currentStep ? styles.workflowStep : {...styles.workflowStep, ...styles.activeStep}}           
          onClick={() => parentProps.onClick(item)} 
          horizontal 
          verticalAlign="center"
        >
          <div style={item.name == parentProps.currentStep ? [styles.workflowStep, styles.activeStep] as Radium.StyleRootProps : styles.workflowStep}>
            <Text style={{fontWeight: 600, color: item.name == parentProps.currentStep ? "white" : "auto"}}>
              {item.name}                                
              {/* {isStepAfterCurrentStep(item.name) ? "+" : null}         */}
            </Text>
            {item.name == parentProps.currentStepAssigned ? <Icon iconName="Error" style={{marginLeft:10}}></Icon> : null}
            {item.name == parentProps.currentStep && parentProps.currentStepRejected ? <Icon iconName="ErrorBadge" style={{marginLeft:10}}></Icon> : null}
            {isStepBeforeCurrentStep(item.name) ? <Icon iconName="Accept" style={{color: "green", fontWeight: 600, marginLeft:10}}></Icon> : null}
          </div>
        </Stack>
        {index+1 != getActiveSteps().length ? <Icon iconName="ChevronRight"></Icon> : null}
      </Stack>
  </>
})