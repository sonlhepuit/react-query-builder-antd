# Phát hành package lên npm

Package: `react-query-builder-antd`

Workflow: `.github/workflows/npm-publish.yml`

Workflow sử dụng npm Trusted Publishing (OIDC), không dùng `NPM_TOKEN`. GitHub Release phải trỏ tới commit đã merge vào `main`; tag release phải khớp version trong `package.json`.

## 1. Version 1.0.0 đã được publish

`react-query-builder-antd@1.0.0` đã tồn tại trên npm. Bước bootstrap thủ công đã hoàn tất và không được chạy lại.

Xác minh version hiện tại:

```bash
npm view react-query-builder-antd version
```

Không chạy lại `npm publish` với version `1.0.0`, vì npm không cho phép ghi đè version đã tồn tại. Không commit token hoặc thêm token vào workflow.

## 2. Trusted Publisher đã được cấu hình

Cấu hình hiện tại trong settings của package trên npm:

- Provider: GitHub Actions
- Organization/User: `sonlhepuit`
- Repository: `react-query-builder-antd`
- Workflow filename: `npm-publish.yml`
- Environment: để trống
- Allowed action: `npm publish`

Nếu cần tạo lại cấu hình, dùng npm CLI 11.15 trở lên:

```bash
npm install --global "npm@^11.15.0"
npm trust github react-query-builder-antd \
  --repo sonlhepuit/react-query-builder-antd \
  --file npm-publish.yml \
  --allow-publish
```

OIDC đã hoạt động. Revoke automation token cũ và xóa repository secret `NPM_TOKEN` hoặc `npm_token` nếu còn tồn tại.

## 3. Deploy version mới từ main

### 3.1. Chọn loại version theo SemVer

| Thay đổi | Khi nào dùng | Ví dụ | Lệnh |
| --- | --- | --- | --- |
| Patch | Sửa lỗi, tối ưu nội bộ hoặc thay đổi nhỏ không làm đổi API hiện có | `1.0.0` → `1.0.1`; `1.1.0` → `1.1.1` | `npm version patch --no-git-tag-version` |
| Minor | Thêm tính năng hoặc option mới nhưng vẫn tương thích với code đang dùng version cũ | `1.0.0` → `1.1.0` | `npm version minor --no-git-tag-version` |
| Major | Xóa hoặc đổi API, props, kiểu dữ liệu hay hành vi khiến code hiện tại có thể phải sửa | `1.x.x` → `2.0.0` | `npm version major --no-git-tag-version` |

Ví dụ thêm option `3DTile` mà không phá API cũ là **minor**. Nếu đang ở `1.0.0`, version mới nên là `1.1.0`. Nếu sau đó chỉ sửa lỗi của tính năng này thì bump patch từ `1.1.0` lên `1.1.1`.

Không chọn patch chỉ vì thay đổi ít dòng; hãy chọn theo mức độ ảnh hưởng đến người dùng. Chỉ sửa README hoặc tài liệu nội bộ thì thường không cần publish package mới.

### 3.2. Các bước phát hành

1. Merge các thay đổi cần phát hành vào `main`.
2. Đồng bộ `main` và tạo release branch:

```bash
git checkout main
git pull --ff-only
git checkout -b release/vX.Y.Z
```

3. Chạy đúng một lệnh bump version. Ví dụ từ `1.0.0`:

```bash
# Sửa lỗi tương thích ngược: 1.0.0 -> 1.0.1
npm version patch --no-git-tag-version

# Hoặc thêm tính năng tương thích ngược: 1.0.0 -> 1.1.0
npm version minor --no-git-tag-version

# Hoặc có breaking change: 1.0.0 -> 2.0.0
npm version major --no-git-tag-version
```

Lệnh này cập nhật cả `package.json` và `package-lock.json`; phải commit cả hai file. Không chạy cả ba lệnh trong cùng một lần phát hành.

4. Build và kiểm tra đúng nội dung sẽ đưa lên npm:

```bash
npm ci --ignore-scripts
npm run build-npm
npm run check-package
npm pack --dry-run
```

Tarball không được chứa `.github/`, `docs/`, `examples/`, `scripts/` hoặc config phát triển.

5. Commit, tạo pull request và merge release branch vào `main`.
6. Tạo GitHub Release từ commit mới nhất của `main`:
   - Tag phải bằng `v` cộng version trong `package.json`, ví dụ version `1.0.1` dùng tag `v1.0.1`.
   - Chọn stable release, không chọn prerelease.
   - Chọn **Publish release**, không chỉ lưu draft.
7. Theo dõi workflow **Publish npm Package**. Workflow sẽ checkout đúng tag, đối chiếu tag với version, build, kiểm tra tarball và publish bằng OIDC.
8. Xác minh version trên npm:

```bash
npm view react-query-builder-antd version
```

OIDC tự động tạo provenance cho package public publish từ GitHub-hosted runner.

## 4. Quy tắc và xử lý lỗi

- Không thể publish lại version đã tồn tại trên npm.
- Nếu workflow fail trước publish, có thể sửa rồi chạy lại release đó.
- Nếu npm đã nhận package, bản sửa tiếp theo phải bump version.
- Không xóa hoặc di chuyển tag đã publish.
- Workflow từ chối tag không bằng `v` cộng version trong `package.json`.
- Với `ENEEDAUTH`, kiểm tra workflow filename, repository, environment trống, `id-token: write`, GitHub-hosted runner và `repository.url`.

Tài liệu chính thức: [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/) và [GitHub OIDC](https://docs.github.com/en/actions/reference/security/oidc).
