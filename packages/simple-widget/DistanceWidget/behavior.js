import macro from "@kitware/vtk.js/macros";

function ignoreKey(e) {
  return e.altKey || e.controlKey || e.shiftKey;
}

export default function widgetBehavior(publicAPI, model) {
  model.classHierarchy.push("vtkDistanceWidgetProp");

  // private variables
  let currentDragHandle = null;
  let firstPointSet = false;
  let secondPointSet = false;

  function isComplete() {
    return firstPointSet && secondPointSet;
  }

  function activateHandle(h) {
    if (model.activeState) {
      model.activeState.deactivate();
    }
    model.activeState = h;
    if (h) {
      model.activeState.setVisible(true);
      h.activate();
    }
  }

  function beginDragging() {
    model.interactor.requestAnimation(publicAPI);
    publicAPI.invokeStartInteractionEvent();
  }

  function endDragging() {
    model.interactor.cancelAnimation(publicAPI);
    publicAPI.invokeEndInteractionEvent();
  }

  // --------------------------------------------------------------------------
  // Left press: Select handle to drag
  // --------------------------------------------------------------------------

  publicAPI.handleLeftButtonPress = (e) => {
    if (!model.activeState?.getActive?.() || !model.pickable || ignoreKey(e)) {
      return macro.VOID;
    }

    const firstHandle = model.widgetState.getFirstPoint();
    const secondHandle = model.widgetState.getSecondPoint();

    if (model.activeState === currentDragHandle) {
      if (!isComplete() && currentDragHandle === firstHandle) {
        firstPointSet = true;

        secondHandle.setOrigin(firstHandle.getOrigin());
        // first handle is placed. switch to second handle.
        activateHandle(secondHandle);
        currentDragHandle = secondHandle;
      } else if (currentDragHandle === secondHandle) {
        // we've placed all points
        secondPointSet = true;
      }
    } else if (isComplete()) {
      currentDragHandle = model.activeState;
      beginDragging();
    }

    // set the manipulation plane to be parallel with camera plane
    // if (currentDragHandle) {
    //   const manipulator = model.factory.getManipulator();
    //   const camera = model.renderer.getActiveCamera();
    //   manipulator.setNormal(camera.getDirectionOfProjection());
    //   manipulator.setOrigin(currentDragHandle.getOrigin());
    // }

    publicAPI.invokeStartInteractionEvent();
    return macro.EVENT_ABORT;
  };

  // --------------------------------------------------------------------------
  // Mouse move: Drag selected handle / Handle follow the mouse
  // --------------------------------------------------------------------------

  publicAPI.handleMouseMove = (callData) => {
    if (model.hasFocus && isComplete()) {
      publicAPI.loseFocus();
      return macro.VOID;
    }

    if (
      model.pickable &&
      model.dragable &&
      model.manipulator &&
      model.activeState &&
      model.activeState.getActive() &&
      !ignoreKey(callData)
    ) {
      const worldCoords = model.manipulator.handleEvent(
        callData,
        model.apiSpecificRenderWindow,
      );

      if (worldCoords.length && model.activeState === currentDragHandle) {
        model.activeState.setOrigin(worldCoords);
        publicAPI.invokeInteractionEvent();
        return macro.EVENT_ABORT;
      }
    }

    return macro.VOID;
  };

  // --------------------------------------------------------------------------
  // Left release: Finish drag / Create new handle
  // --------------------------------------------------------------------------

  publicAPI.handleLeftButtonRelease = () => {
    if (isComplete()) {
      endDragging();
      model.apiSpecificRenderWindow.setCursor("pointer");
      model.widgetState.deactivate();
      currentDragHandle = null;
    }
  };

  // --------------------------------------------------------------------------
  // Focus API - modeHandle follow mouse when widget has focus
  // --------------------------------------------------------------------------

  publicAPI.grabFocus = () => {
    if (!model.hasFocus && !isComplete()) {
      model.activeState = model.widgetState.getFirstPoint();
      model.activeState.activate();
      model.activeState.setVisible(true);
      currentDragHandle = model.activeState;
      beginDragging();
      model.hasFocus = true;
    }
  };

  // --------------------------------------------------------------------------

  publicAPI.loseFocus = () => {
    if (model.hasFocus) {
      endDragging();
    }
    model.widgetState.deactivate();
    model.activeState = null;
    model.hasFocus = false;
    model.widgetManager.enablePicking();
    model.interactor.render();
  };
}
