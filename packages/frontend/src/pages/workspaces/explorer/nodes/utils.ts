import { OutputSocketInformation } from './Sockets';
import { nodeTypes, EditorContext } from './AllNodes';
import { ConnectionInstance, SocketDef } from '@masterthesis/shared';

export const getInputNode = (
  socketName: string,
  nodeId: string,
  connections: Array<ConnectionInstance>
) => {
  const inputs = connections.filter(
    n => n.to && n.to.nodeId === nodeId && n.to.name === socketName
  );
  if (inputs.length !== 1) {
    return null;
  }

  return inputs[0].from;
};

export const getOutputNodes = (
  socketName: string,
  nodeId: string,
  connections: Array<ConnectionInstance>
) => {
  const outputs = connections.filter(
    n => n.from && n.from.nodeId === nodeId && n.from.name === socketName
  );
  if (outputs.length === 0) {
    return null;
  }

  return outputs.map(c => c.to).filter(n => n !== null);
};

export const getInputInformation = (
  context: EditorContext
): Map<string, OutputSocketInformation> => {
  const node = nodeTypes.get(context.node.type);
  if (!node) {
    throw new Error('Unknown node type!');
  }

  return new Map<string, OutputSocketInformation>(
    Array.from<SocketDef>(Object.values(node.inputs))
      .map(i => {
        const inputSocketName = i.name;
        const inputConnection = context.state.connections.find(
          n =>
            n.to !== null &&
            n.to.nodeId === context.node.id &&
            n.to.name === inputSocketName
        );
        if (!inputConnection || inputConnection.from === null) {
          return null;
        }

        const inputNode = context.state.nodes.find(
          n => n.id === inputConnection.from!.nodeId
        );
        if (!inputNode) {
          throw new Error('Invalid connection with unknown node.');
        }

        const nodeInputType = nodeTypes.get(inputNode.type);
        if (!nodeInputType) {
          throw new Error('Unknown node type!');
        }

        const inputs = getInputInformation({
          node: inputNode,
          state: context.state
        });

        const outputs = nodeInputType.onClientExecution
          ? nodeInputType.onClientExecution(inputs, {
              state: context.state,
              node: inputNode
            })
          : new Map();

        return {
          name: i.name,
          output: outputs.get(inputConnection.from.name) || null
        };
      })
      .filter(n => n !== null && n.output !== null)
      .map<[string, OutputSocketInformation]>(v => [v!.name, v!.output!])
  );
};

export const getValidInput = (
  name: string,
  inputs: Map<string, OutputSocketInformation>
) => {
  const elem = inputs.get(name);
  if (elem && elem.isPresent !== false) {
    return elem;
  }
  return null;
};
