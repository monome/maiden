import React, { Component } from 'react';

import './tree.css';

const Loading = ({ style }) => <div style={style}>loading...</div>;

const Toggle = ({ style }) => {
  const { height, width } = style;
  // Base inset so the triangle centroid sits at the SVG center; rotate(90deg)
  // then keeps the open (down) state aligned with the label.
  const baseX = (3 * (width / 2) - width) / 2; // => width/4 for square icons
  const midHeight = height * 0.5;
  const points = `${baseX},0 ${baseX},${height} ${width},${midHeight}`;

  return (
    <div style={style.base}>
      <div style={style.wrapper}>
        <svg height={height} width={width} style={{ display: 'block' }}>
          <polygon points={points} style={style.arrow} />
        </svg>
      </div>
    </div>
  );
};

const Header = ({ node, style }) => (
  <div style={style.base}>
    <div style={style.title}>{node.name}</div>
  </div>
);

class Container extends Component {
  render() {
    const { style, decorators, terminal, onClick, node } = this.props;
    const ToggleDecorator = decorators.Toggle;
    const HeaderDecorator = decorators.Header;
    const toggleClass = node.toggled ? 'explorer-tree-toggle toggled' : 'explorer-tree-toggle';
    const rowStyle = {
      ...style.container,
      display: 'flex',
      alignItems: 'center',
    };

    return (
      <div onClick={onClick} style={rowStyle} role="presentation">
        {!terminal ? (
          <span className={toggleClass}>
            <ToggleDecorator style={style.toggle} />
          </span>
        ) : (
          <span className="explorer-tree-toggle-spacer" />
        )}
        <HeaderDecorator node={node} style={style.header} />
      </div>
    );
  }
}

export const decorators = {
  Loading,
  Toggle,
  Header,
  Container,
};

class TreeNode extends Component {
  onClick = () => {
    const { node, onToggle } = this.props;
    if (onToggle) {
      onToggle(node, !node.toggled);
    }
  };

  render() {
    const { node, style, decorators: propsDecorators, onToggle } = this.props;
    const nodeDecorators = { ...propsDecorators, ...(node.decorators || {}) };
    const terminal = !node.children;
    const headerStyle = { ...style, container: style.container };
    const NodeContainer = nodeDecorators.Container;

    return (
      <li style={style.base}>
        <NodeContainer
          decorators={nodeDecorators}
          node={node}
          onClick={this.onClick}
          style={headerStyle}
          terminal={terminal}
        />
        {node.toggled ? this.renderChildren(nodeDecorators, onToggle) : null}
      </li>
    );
  }

  renderChildren(nodeDecorators, onToggle) {
    const { node, style, decorators: propsDecorators } = this.props;
    const LoadingDecorator = nodeDecorators.Loading;

    if (node.loading) {
      return (
        <ul style={style.subtree} className="explorer-tree-subtree">
          <li>
            <LoadingDecorator style={style.loading} />
          </li>
        </ul>
      );
    }

    let { children } = node;
    if (!Array.isArray(children)) {
      children = children ? [children] : [];
    }

    return (
      <ul style={style.subtree} className="explorer-tree-subtree">
        {children.map((child, index) => (
          <TreeNode
            key={child.url || child.id || index}
            decorators={propsDecorators}
            node={child}
            onToggle={onToggle}
            style={style}
          />
        ))}
      </ul>
    );
  }
}

class Tree extends Component {
  render() {
    const { data: propsData, onToggle, style, decorators: propsDecorators } = this.props;
    const data = Array.isArray(propsData) ? propsData : [propsData];
    const treeDecorators = propsDecorators || decorators;

    return (
      <ul className="explorer-tree" style={style.tree.base}>
        {data.map((node, index) => (
          <TreeNode
            key={node.url || node.id || index}
            decorators={treeDecorators}
            node={node}
            onToggle={onToggle}
            style={style.tree.node}
          />
        ))}
      </ul>
    );
  }
}

export default Tree;
