import "@kitware/vtk.js/Rendering/Profiles/Geometry";
import "@kitware/vtk.js/Rendering/Profiles/Glyph";

import macro from "@kitware/vtk.js/macros";
import vtkAbstractWidgetFactory from "@kitware/vtk.js/Widgets/Core/AbstractWidgetFactory";
import vtkPlanePointManipulator from "@kitware/vtk.js/Widgets/Manipulators/PlaneManipulator";
import vtkPolyLineRepresentation from "@kitware/vtk.js/Widgets/Representations/PolyLineRepresentation";
import vtkSphereHandleRepresentation from "@kitware/vtk.js/Widgets/Representations/SphereHandleRepresentation";
import { distance2BetweenPoints } from "@kitware/vtk.js/Common/Core/Math";

import { ViewTypes } from "@kitware/vtk.js/Widgets/Core/WidgetManager/Constants";

import widgetBehavior from "./behavior";
import stateGenerator from "./state";

// ----------------------------------------------------------------------------
// Factory
// ----------------------------------------------------------------------------

function vtkDistanceWidget(publicAPI, model) {
  model.classHierarchy.push("vtkDistanceWidget");

  model.methodsToLink = [
    "activeScaleFactor",
    "activeColor",
    "useActiveColor",
    "glyphResolution",
    "defaultScale",
  ];

  model.behavior = widgetBehavior;
  model.widgetState = stateGenerator();

  publicAPI.getRepresentationsForViewType = (viewType) => {
    switch (viewType) {
      case ViewTypes.DEFAULT:
      case ViewTypes.GEOMETRY:
      case ViewTypes.SLICE:
      case ViewTypes.VOLUME:
      default:
        return [
          {
            builder: vtkPolyLineRepresentation,
            labels: ["points"],
          },
          { builder: vtkSphereHandleRepresentation, labels: ["points"] },
        ];
    }
  };

  // --- Public methods -------------------------------------------------------

  publicAPI.getDistance = () => {
    const handles = model.widgetState.getHandleList();
    if (handles.length !== 2) {
      return 0;
    }
    return Math.sqrt(
      distance2BetweenPoints(handles[0].getOrigin(), handles[1].getOrigin()),
    );
  };

  // --------------------------------------------------------------------------
  // initialization
  // --------------------------------------------------------------------------

  // Default manipulator
  model.manipulator = vtkPlanePointManipulator.newInstance();
}

// ----------------------------------------------------------------------------

const DEFAULT_VALUES = {
  // manipulator: null,
};

// ----------------------------------------------------------------------------

export function extend(publicAPI, model, initialValues = {}) {
  Object.assign(model, DEFAULT_VALUES, initialValues);

  vtkAbstractWidgetFactory.extend(publicAPI, model, initialValues);
  macro.setGet(publicAPI, model, ["manipulator"]);

  vtkDistanceWidget(publicAPI, model);
}

// ----------------------------------------------------------------------------

export const newInstance = macro.newInstance(extend, "vtkDistanceWidget");

// ----------------------------------------------------------------------------

export default { newInstance, extend };
