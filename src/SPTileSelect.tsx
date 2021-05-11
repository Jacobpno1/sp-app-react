import React from "react";

interface SPTileSelectProps{
  options: SPTileSelectOption[]
}

interface SPTileSelectOption{
  label: string
  value: any
  iconName: string
  spFieldName: string
  description?: string
  order?: number
  parentValue?: any
}

export function SPTileSelect(props:any){

  // return(<div>
  //   <div ng-hide="hideBreadcrumbs" className="crumb-ctr">
  //     <div className="crumb-tile" ng-repeat="item in $ctrl.breadcrumbs" ng-class="{selection: item.Title, 'read-only': $ctrl.readOnly}"
  //       ng-click="selectBreadcrumb($index,item);">
  //       <div ng-hide="item.Title">
  //         <div>Please Select</div>
  //         <h2>{{item.FieldLabel}}</h2>
  //       </div>
  //       <i className="ms-Icon" ng-show="item.Title" ng-class="'ms-Icon--' + item.data.IconName" aria-hidden="true"></i>
  //       <div ng-show="item.Title">
  //         <div>{{item.FieldLabel}}</div>
  //         <h2>{{item.Title}}</h2>
  //       </div>
  //     </div>
  //   </div>
  //   <div className="tile-box-ctr">
  //     <div className="tile-box" ng-repeat="item in $ctrl.list | filter: {'Field': $ctrl.displayField} : true | orderBy: 'Order0'" ng-click="selectTile(item);">
  //       <i className="ms-Icon" ng-class="'ms-Icon--' + item.IconName" aria-hidden="true"></i>
  //       <h2>{{item.Title}}</h2>
  //       <div className="tile-box-text" ng-bind-html="item.Description"></div>
  //     </div>
  //   </div>
  // </div>)
}