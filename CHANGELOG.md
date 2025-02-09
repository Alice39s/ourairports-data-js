# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2024-02-09

### Changed
- Optimized build output structure for better module consumption
  - Separated Node.js and browser builds into distinct directories
  - Added proper CommonJS support for Node.js environment
  - Improved ESM module format for browser environment
- Enhanced type declarations generation
  - Added separate type declarations for Node.js and browser builds
  - Improved type definitions organization

### Optimized
- Significantly reduced JSON data file sizes through minification
- Improved module tree-shaking support
- Better source maps generation for both Node.js and browser builds

### Fixed
- Fixed incorrect file extensions in package exports
- Resolved module format compatibility issues
- Fixed type declarations path in package.json

[1.0.2]: https://github.com/alice39s/ourairports-data-js/compare/v1.0.1...v1.0.2 