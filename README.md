# react-query-builder-antd

[![npm version](https://img.shields.io/npm/v/react-query-builder-antd.svg)](https://www.npmjs.com/package/react-query-builder-antd)
[![license](https://img.shields.io/npm/l/react-query-builder-antd.svg)](https://www.npmjs.com/package/react-query-builder-antd)

A configurable React query builder with Ant Design widgets. It supports nested groups, custom fields and operators, import/export helpers, and model data types including `XML`, `IFC`, and `3DTile`.

## Installation

Install the package:

```bash
npm install react-query-builder-antd
```

Install the primary React and Ant Design peer dependencies if they are not already present in your application:

```bash
npm install react@18 react-dom@18 antd@4 @ant-design/icons@4
```

## Basic usage

```tsx
import React, { useCallback, useMemo, useState } from "react";
import {
  Builder,
  Query,
  Utils,
} from "react-query-builder-antd";
import type {
  BuilderProps,
  Config,
  ImmutableTree,
} from "react-query-builder-antd";
import AntdConfig from "react-query-builder-antd/lib/config/antd";

import "antd/dist/antd.css";
import "react-query-builder-antd/css/styles.scss";

const initialValue = {
  id: Utils.uuid(),
  type: "group",
  children1: {},
};

export default function App() {
  const config = useMemo<Config>(
    () => ({
      ...AntdConfig,
      fields: {
        name: {
          label: "Name",
          type: "text",
        },
      },
    }),
    []
  );

  const [tree, setTree] = useState<ImmutableTree>(() =>
    Utils.checkTree(Utils.loadTree(initialValue), config)
  );

  const onChange = useCallback((nextTree: ImmutableTree) => {
    setTree(nextTree);
  }, []);

  const renderBuilder = useCallback(
    (props: BuilderProps) => (
      <div className="query-builder-container">
        <div className="query-builder qb-lite">
          <Builder {...props} />
        </div>
      </div>
    ),
    []
  );

  return (
    <Query
      {...config}
      value={tree}
      onChange={onChange}
      renderBuilder={renderBuilder}
    />
  );
}
```

The current peer dependency range supports React 16–18 and Ant Design 4. The command above uses React 18 and Ant Design 4 for a new application.

## Run the local example

The example application resolves imports directly to the repository's `modules/` directory. Changes to the local library source are therefore reflected by the development server without publishing or installing the npm package.

### Prerequisites

- Git
- Node.js and npm; the publish workflow uses Node.js 24

### Start the development server

```bash
git clone https://github.com/sonlhepuit/react-query-builder-antd.git
cd react-query-builder-antd
npm install
npm run examples
```

Open [http://localhost:3001](http://localhost:3001). Edit files in `modules/` or `examples/demo/`; webpack-dev-server will rebuild the application automatically.

To run the example commands explicitly instead of using the root shortcut:

```bash
npm install
npm --prefix examples install
npm --prefix examples start
```

## Build and inspect the npm package

```bash
npm ci --ignore-scripts
npm run build-npm
npm run check-package
npm pack --dry-run
```

Only runtime package content from `lib/`, `modules/`, and `css/` is published. Examples, documentation, GitHub workflows, build scripts, and development configuration remain in the Git repository.

## Troubleshooting the example

### `cross-env: not found`

Install dependencies from the repository root before starting the example:

```bash
npm install
npm run examples
```

### `Can't resolve 'process/browser'`

Make sure the root development dependencies are installed. If the error persists in an existing checkout, refresh the browser polyfills:

```bash
npm install --save-dev process buffer
npm run examples
```

### `EADDRINUSE: address already in use :::3001`

Another development server is already using port 3001. Open the existing server at [http://localhost:3001](http://localhost:3001), or start another instance on a different port:

```bash
npm --prefix examples start -- --port 3002
```

Then open [http://localhost:3002](http://localhost:3002).

### `ENOSPC: System limit for number of file watchers reached`

On Linux, increase the watcher limit for the current boot:

```bash
sudo sysctl -w fs.inotify.max_user_watches=524288
```

Alternatively, enable polling for the example. Polling can use more CPU:

```bash
CHOKIDAR_USEPOLLING=1 npm run examples
```

## Publishing

- [Hướng dẫn phát hành bằng tiếng Việt](./docs/PUBLISHING.vi.md)
- [Publishing guide in English](./docs/PUBLISHING.en.md)

New npm versions are published by the GitHub Actions Trusted Publishing workflow after a stable GitHub Release is published.

## License

MIT
