import vtkStateBuilder from "@kitware/vtk.js/Widgets/Core/StateBuilder";

export default function generateState() {
  return vtkStateBuilder
    .createBuilder()
    .addStateFromMixin({
      labels: ["points"],
      mixins: ["origin", "color", "scale1", "visible"],
      name: "firstPoint",
      initialValues: {
        scale1: 0.1,
        origin: [-1, -1, -1],
        visible: false,
      },
    })
    .addStateFromMixin({
      labels: ["points"],
      mixins: ["origin", "color", "scale1", "visible"],
      name: "secondPoint",
      initialValues: {
        scale1: 0.1,
        origin: [-1, -1, -1],
        visible: false,
      },
    })
    .build();
}
