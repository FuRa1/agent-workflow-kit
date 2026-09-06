# Update Mechanism for Design-Polish Skill

## Overview

This document outlines the enhanced update mechanism for the design-polish skill that supports package updates and client-side changes while maintaining backward compatibility.

## Key Features

### 1. Version Tracking
- Tracks skill versions in lock files
- Compares current vs bundled skill versions
- Supports migration path determination for breaking changes

### 2. Dependency Management
- Detects package dependency changes in project's `package.json`
- Suggests appropriate package updates when needed
- Handles version conflicts between skills and project dependencies

### 3. Conflict Resolution
- Identifies conflicts between modified user files and bundled files
- Provides clear migration guidance for breaking changes
- Supports rollback mechanisms for failed updates

### 4. Smart Update Detection
- Automatically detects when skill updates are available
- Analyzes package dependency changes
- Determines required migration steps

## Implementation Details

### Lock File Enhancement
The lock file schema now includes:
```json
{
  "schemaVersion": 1,
  "packageVersion": "1.0.0",
  "skills": {
    "design-polish": {
      "version": "0.1.0",
      "files": {
        "SKILL.md": "sha256-hash-of-file",
        "references/workflow.md": "sha256-hash-of-file"
      }
    }
  },
  "files": {
    ".workflow-kit/project.json": "sha256-hash-of-config",
    "design-polish.project.json": "sha256-hash-of-adapter"
  }
}
```

### Update Commands
The following commands are supported:
- `workflow-kit update design-polish` - Update the design-polish skill
- `workflow-kit update --check` - Check for available updates without applying
- `workflow-kit update --all` - Update all skills in the project

### Migration Process
1. **Version Check**: Compare current skill versions with bundled versions
2. **Dependency Analysis**: Analyze package.json for dependency changes  
3. **Conflict Detection**: Identify conflicts between installed and desired files
4. **Migration Planning**: Determine required migration steps
5. **Preview Generation**: Show what changes will be applied
6. **Execution**: Apply changes with proper conflict resolution
7. **Validation**: Ensure all functionality remains intact after update

## Benefits

- **Seamless Updates**: Users can update skills without manual intervention
- **Conflict Prevention**: Better handling of modified files and configurations
- **Dependency Management**: Proper handling of package dependency updates
- **Migration Support**: Clear guidance for upgrading between versions
- **User Experience**: Improved workflow with clear previews and rollback options

## Backward Compatibility

The system maintains backward compatibility by:
- Providing clear migration paths for breaking changes
- Supporting rollback mechanisms
- Preserving user configurations during upgrades
- Documenting all breaking changes in release notes

## Integration Points

### CLI Commands
- Extend `update` command to support version checking and migration
- Add `upgrade` command for explicit skill upgrades  
- Implement `check` command to preview updates

### Lock File System
- Enhance validation to include version information
- Add version comparison logic
- Implement migration tracking

### Skill Files
- Include version information in SKILL.md metadata
- Provide upgrade documentation within skills
- Support multiple versions of skill files

## Testing Considerations

1. **Unit Tests**: Test version tracking and conflict resolution logic
2. **Integration Tests**: Test full update workflow from command to execution
3. **Regression Tests**: Ensure existing functionality remains intact
4. **User Experience Tests**: Validate that update previews are clear and helpful

This enhanced update mechanism makes the design-polish skill more robust while maintaining all existing functionality and efficiency improvements.