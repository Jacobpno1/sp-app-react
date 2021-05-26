import React from 'react';
import { Stack, DefaultEffects, Text, Icon } from '@fluentui/react';
import './SPWorkflowSteps.css'

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
      {getActiveSteps().map((i:any, index:number) => <Stack key={index} horizontal verticalAlign="center">
        <Stack style={stepStyle} className={i.name == props.currentStep ? "workflow-step active-step" : "workflow-step"} onClick={() => props.onClick(i)} horizontal verticalAlign="center">
          <Text style={{fontWeight: 600, color: i.name == props.currentStep ? "white" : "auto"}}>
            {i.name}
                                
            {/* {isStepAfterCurrentStep(i.name) ? "+" : null}         */}
          </Text>
          {i.name == props.currentStepAssigned ? <Icon iconName="Error" style={{marginLeft:10}}></Icon> : null}
          {i.name == props.currentStep && props.currentStepRejected ? <Icon iconName="ErrorBadge" style={{marginLeft:10}}></Icon> : null}
          {isStepBeforeCurrentStep(i.name) ? <Icon iconName="Accept" style={{color: "green", fontWeight: 600, marginLeft:10}}></Icon> : null}
        </Stack>
        {index+1 != getActiveSteps().length ? <Icon iconName="ChevronRight"></Icon> : null}
      </Stack> )}      
    </Stack>
  </>
}