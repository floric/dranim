import {
  ConnectionWithoutId,
  SocketInstance,
  SocketType
} from '@masterthesis/shared';
import * as Konva from 'konva';

import { ExplorerEditorState } from '../ExplorerEditor';
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
  c: ConnectionWithoutId,
  stage: Konva.Stage,
  connsLayer: Konva.Layer,
  socketsMap: Map<string, Konva.Group>,
  nodeMap: Map<string, Konva.Group>,
  changeState: (newState: Partial<ExplorerEditorState>) => void
) => {
  const fromSocket = c.from;
  const toSocket = c.to;
  const outputSocket = getSocket(fromSocket, SocketType.OUTPUT, socketsMap);
  const inputSocket = getSocket(toSocket, SocketType.INPUT, socketsMap);
  const connectionLine = renderLine(inputSocket, outputSocket, stage);

  const adjustPoint = e => {
    if (!outputSocket || !inputSocket) {
      return;
    }

    connectionLine.points(
      getConnectionPoints(
        outputSocket.getAbsolutePosition(),
        inputSocket.getAbsolutePosition()
      )
    );

    connsLayer.draw();
  };

  if (fromSocket) {
    nodeMap.get(fromSocket.nodeId)!.on('dragmove', adjustPoint);
  }
  if (toSocket) {
    nodeMap.get(toSocket.nodeId)!.on('dragmove', adjustPoint);
  }
  if (!toSocket || !fromSocket) {
    stage.on('mousemove', () => {
      connectionLine.points(
        getConnectionPoints(
          getSocketPositionOrPointer(outputSocket, stage),
          getSocketPositionOrPointer(inputSocket, stage)
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

  return connectionLine;
};

const getSocketPositionOrPointer = (
  socket: Konva.Group | null,
  stage: Konva.Stage
) => (socket ? socket.getAbsolutePosition() : stage.getPointerPosition());

const getSocket = (
  socket: SocketInstance,
  type: SocketType,
  socketsMap: Map<string, Konva.Group>
): Konva.Group | null =>
  socket ? socketsMap.get(getSocketId(type, socket.nodeId, socket.name)) : null;

const renderLine = (
  inputSocket: Konva.Group | null,
  outputSocket: Konva.Group | null,
  stage: Konva.Stage
) => {
  const isCurrentlyChanged = !inputSocket || !outputSocket;
  const line = new Konva.Line({
    strokeWidth: isCurrentlyChanged ? 4 : 2,
    strokeEnabled: true,
    stroke: isCurrentlyChanged ? '#666' : '#999',
    points: getConnectionPoints(
      getSocketPositionOrPointer(outputSocket, stage) ||
        inputSocket.getAbsolutePosition(),
      getSocketPositionOrPointer(inputSocket, stage) ||
        outputSocket.getAbsolutePosition()
    ),
    ...({ bezier: true } as any)
  });

  return line;
};
