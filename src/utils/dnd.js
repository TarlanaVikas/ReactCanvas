import useStore from "../store/useStore";
import useUi from "../store/useUi";

/** Apply the drag currently in flight to `targetId` at `pos`, then reset drag state. */
export function performDrop(targetId, pos) {
  const ui = useUi.getState();
  const { drag } = ui;
  if (!drag) return;
  const store = useStore.getState();

  if (drag.kind === "move") {
    store.moveNode(drag.value, targetId, pos);
  } else if (pos === "inside") {
    store.addComponent(drag.value, { parentId: targetId, index: -1 });
  } else {
    const loc = locate(store.layoutTree, targetId);
    if (loc) {
      store.addComponent(drag.value, {
        parentId: loc.parent.id,
        index: loc.index + (pos === "after" ? 1 : 0),
      });
    }
  }
  ui.setDrag(null);
  ui.setDrop(null);
}

const locate = (node, id) => {
  for (let i = 0; i < (node.children || []).length; i++) {
    const c = node.children[i];
    if (c.id === id) return { parent: node, index: i };
    const deeper = locate(c, id);
    if (deeper) return deeper;
  }
  return null;
};

/** Start dragging a component type out of the library. */
export function startTypeDrag(e, type) {
  e.dataTransfer.setData("application/x-rc-type", type);
  e.dataTransfer.effectAllowed = "copy";
  useUi.getState().setDrag({ kind: "type", value: type });
}
export const endDrag = () => useUi.getState().setDrag(null);
