import * as Konva from 'konva';
import {
  ExplorerEditorState,
  ConnectionInstance,
  ExplorerEditorProps
} from '../ExplorerEditor';
import { getSocketId } from './Sockets';

const CONNECTION_STIFFNESS = 0.7;

const getConnectionPoints = (output: Konva.Vector2d, input: Konva.Vector2d) => [
  output.x,
  output.y,
  output.x + Math.abs(input.x - output.x) * CONNECTION_STIFFNESS,
  output.y,
  input.x - Math.abs(input.x - output.x) * CONNECTION_STIFFNESS,
  input.y,
  input.x,
  input.y
];

export const renderConnection = (
  c: ConnectionInstance,
  server: ExplorerEditorProps,
  state: ExplorerEditorState,
  stage: Konva.Stage,
  connsLayer: Konva.Layer,
  socketsMap: Map<string, Konva.Group>,
  nodeMap: Map<string, Konva.Group>,
  changeState: (newState: Partial<ExplorerEditorState>) => void
) => {
  const outputSocket = c.from
    ? socketsMap.get(getSocketId('output', c.from.nodeId, c.from.name))
    : null;
  const inputSocket = c.to
    ? socketsMap.get(getSocketId('input', c.to.nodeId, c.to.name))
    : null;
  const isCurrentlyChanged = !inputSocket || !outputSocket;

  const line = new Konva.Line({
    strokeWidth: isCurrentlyChanged ? 4 : 2,
    strokeEnabled: true,
    stroke: isCurrentlyChanged ? '#666' : '#999',
    points: getConnectionPoints(
      outputSocket
        ? outputSocket.getAbsolutePosition()
        : stage.getPointerPosition() || inputSocket!.getAbsolutePosition(),
      inputSocket
        ? inputSocket.getAbsolutePosition()
        : stage.getPointerPosition() || outputSocket!.getAbsolutePosition()
    ),
    ...({ bezier: true } as any)
  });

  const adjustPoint = e => {
    if (!outputSocket || !inputSocket) {
      return;
    }
    line.points(
      getConnectionPoints(
        outputSocket.getAbsolutePosition(),
        inputSocket.getAbsolutePosition()
      )
    );
    connsLayer.draw();
  };

  if (c.from) {
    nodeMap.get(c.from.nodeId)!.on('dragmove', adjustPoint);
  }
  if (c.to) {
    nodeMap.get(c.to.nodeId)!.on('dragmove', adjustPoint);
  }
  if (!c.to || !c.from) {
    stage.on('mousemove', () => {
      line.points(
        getConnectionPoints(
          outputSocket
            ? outputSocket.getAbsolutePosition()
            : stage.getPointerPosition(),
          inputSocket
            ? inputSocket.getAbsolutePosition()
            : stage.getPointerPosition()
        )
      );
      connsLayer.draw();
    });

    stage.on('mousedown', () => {
      changeState({
        openConnection: null
      });
    });
  }

  return line;
};
