import macros from "@kitware/vtk.js/macros";
import vtk from "@kitware/vtk.js/vtk";
import vtkParentClass from "@kitware/vtk.js/Kit/Module/ParentClass";
import vtkOtherClass from "@kitware/vtk.js/Kit/Module/OtherClass";
import Constants from "@kitware/vtk.js/Kit/Module/Constants";

const { Representation } = Constants;

// ----------------------------------------------------------------------------
// Global methods
// ----------------------------------------------------------------------------

// Add module-level functions or api that you want to expose statically via
// the next section...

function moduleScopedMethod() {
  // do stuff
}

function moduleScopedStaticMethod() {
  // do more stuff
}

// ----------------------------------------------------------------------------
// Static API
// ----------------------------------------------------------------------------

export const STATIC = {
  moduleScopedStaticMethod,
};

function vtkMyClass(publicAPI, model) {
  model.classHierarchy.push("vtkMyClass");

  const superClass = Object.assign({}, publicAPI);

  publicAPI.exposedMethod = () => {
    // publicly exposed method of this object
  };

  publicAPI.overriddenMethod = () => {
    superClass.overriddenMethod();
    // custom code here
  };
}

// ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------

const DEFAULT_VALUES = {
  myProp1: [0, 0, 0],
  // myProp2: null,     // Do not initialize internal objects here
  myProp3: true,
  myProp4: 6,
  myProp5: [1, 2, 3, 4],
  myProp6: Representation.WIREFRAME,
};

// ----------------------------------------------------------------------------

export function extend(publicAPI, model, initialValues = {}) {
  Object.assign(model, DEFAULT_VALUES, initialValues);

  // Inheritance
  vtkParentClass.extend(publicAPI, model, initialValues);

  // Internal objects initialization
  if (model.myProp2) {
    model.myProp2 = vtk(model.myProp2);
  } else {
    model.myProp2 = vtkOtherClass.newInstance();
  }

  // Create get-only macros
  macros.get(publicAPI, model, ["myProp2", "myProp4"]);

  // Create get-set macros
  macros.setGet(publicAPI, model, ["myProp3"]);

  // Create set macros for array (needs to know size)
  macros.setArray(publicAPI, model, ["myProp5"], 4);

  // Create get macros for array
  macros.getArray(publicAPI, model, ["myProp1", "myProp5"]);

  // Create get-set macros for enum type
  macros.setGet(publicAPI, model, [
    { name: "myProp6", enum: Representation, type: "enum" },
  ]);

  // For more macro methods, see "Sources/macros.js"

  // Object specific methods
  vtkMyClass(publicAPI, model);
}

export const newInstance = macros.newInstance(extend, "vtkMyClass");
