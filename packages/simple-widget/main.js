import "./style.css";

import "@kitware/vtk.js/Rendering/Profiles/Geometry";
import "@kitware/vtk.js/Rendering/Misc/RenderingAPIs";

import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkConeSource from "@kitware/vtk.js/Filters/Sources/ConeSource";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import vtkRenderer from "@kitware/vtk.js/Rendering/Core/Renderer";
import vtkRenderWindow from "@kitware/vtk.js/Rendering/Core/RenderWindow";
import vtkRenderWindowInteractor from "@kitware/vtk.js/Rendering/Core/RenderWindowInteractor";
import vtkInteractorStyleTrackballCamera from "@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera";
import vtkWidgetManager from "@kitware/vtk.js/Widgets/Core/WidgetManager";

import vtkDistanceWidgetFactory from "./DistanceWidget";

function createRenderWindow(el) {
  const renderWindow = vtkRenderWindow.newInstance();
  const renderer = vtkRenderer.newInstance();

  renderWindow.addRenderer(renderer);

  // picks webgl or webgpu
  const apiSpecificRenderWindow = renderWindow.newAPISpecificView();
  apiSpecificRenderWindow.setContainer(el);
  renderWindow.addView(apiSpecificRenderWindow);

  // create interactor and bind
  const interactor = vtkRenderWindowInteractor.newInstance();
  interactor.setInteractorStyle(
    vtkInteractorStyleTrackballCamera.newInstance(),
  );

  interactor.setView(apiSpecificRenderWindow);
  interactor.initialize();
  interactor.bindEvents(el);

  apiSpecificRenderWindow.setSize(600, 600);

  return {
    renderWindow,
    renderer,
    interactor,
    apiSpecificRenderWindow,
  };
}

const components = createRenderWindow(document.getElementById("app"));
const { renderer, renderWindow } = components;

// create a cone
function createConePipeline() {
  const coneSource = vtkConeSource.newInstance();
  const actor = vtkActor.newInstance();
  const mapper = vtkMapper.newInstance();

  actor.setMapper(mapper);
  mapper.setInputConnection(coneSource.getOutputPort());

  renderer.addActor(actor);
  return { coneSource, mapper, actor };
}

const pipeline = createConePipeline();
const cone = pipeline.coneSource.getOutputData();

// widgets
const widgetManager = vtkWidgetManager.newInstance();
widgetManager.setRenderer(renderer);

const widget = vtkDistanceWidgetFactory.newInstance();
widget.placeWidget(cone.getBounds());

const viewWidget = widgetManager.addWidget(widget);
global.viewWidget = viewWidget;

widgetManager.enablePicking();
widgetManager.grabFocus(widget);

// render
renderer.resetCamera();
renderWindow.render();

global.mapper = pipeline.mapper;
global.cone = cone;
