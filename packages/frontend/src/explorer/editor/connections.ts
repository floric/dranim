import {
  Colors,
  ConnectionWithoutId,
  SocketInstance,
  SocketType
} from '@masterthesis/shared';
import { Group, Layer, Line, Stage, Vector2d } from 'konva';

import { EditorFunctions } from './editor-stage';
import { getSocketId } from './sockets';

const CONNECTION_STIFFNESS = 0.7;

const getConnectionPoints = (output: Vector2d, input: Vector2d) => [
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
  stage: Stage,
  connsLayer: Layer,
  socketsMap: Map<string, Group>,
  nodeMap: Map<string, Group>,
  editorFunctions: EditorFunctions
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
    stage
      .on('mousemove', () => {
        connectionLine.points(
          getConnectionPoints(
            getSocketPositionOrPointer(outputSocket, stage),
            getSocketPositionOrPointer(inputSocket, stage)
          )
        );
        connsLayer.draw();
      })
      .on('mousedown', () => {
        editorFunctions.changeState({
          openConnection: null
        });
      });
  }

  return connectionLine;
};

const getSocketPositionOrPointer = (socket: Group | null, stage: Stage) =>
  socket ? socket.getAbsolutePosition() : stage.getPointerPosition();

const getSocket = (
  socket: SocketInstance,
  type: SocketType,
  socketsMap: Map<string, Group>
): Group | null =>
  socket ? socketsMap.get(getSocketId(type, socket.nodeId, socket.name)) : null;

const renderLine = (
  inputSocket: Group | null,
  outputSocket: Group | null,
  stage: Stage
) => {
  const isCurrentlyChanged = !inputSocket || !outputSocket;
  const line = new Line({
    strokeWidth: isCurrentlyChanged ? 4 : 2,
    strokeEnabled: true,
    stroke: isCurrentlyChanged ? Colors.GrayDark : Colors.GrayMedium,
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
