import dagre from '@dagrejs/dagre'
import type { Node, Edge } from '@xyflow/react'

const NODE_W = 200
const NODE_H = 72

export function applyDagreLayout(
  nodes: Node[],
  edges: Edge[],
  options: { direction?: 'TB' | 'LR'; rankSep?: number; nodeSep?: number } = {}
): Node[] {
  const { direction = 'TB', rankSep = 120, nodeSep = 60 } = options

  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: direction, nodesep: nodeSep, ranksep: rankSep, marginx: 40, marginy: 40 })

  nodes.forEach(node => {
    g.setNode(node.id, {
      width:  (node.style?.width  as number | undefined) ?? NODE_W,
      height: (node.style?.height as number | undefined) ?? NODE_H,
    })
  })

  edges.forEach(edge => {
    if (g.hasNode(edge.source) && g.hasNode(edge.target)) {
      g.setEdge(edge.source, edge.target)
    }
  })

  dagre.layout(g)

  return nodes.map(node => {
    const pos = g.node(node.id)
    const w = (node.style?.width  as number | undefined) ?? NODE_W
    const h = (node.style?.height as number | undefined) ?? NODE_H
    return {
      ...node,
      position: {
        x: pos.x - w / 2,
        y: pos.y - h / 2,
      },
    }
  })
}
