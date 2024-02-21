# Change Log

All notable changes to the "branch-creator" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.0.6] - 2024-02-21

### Added
- **Configuration for Showing Remote Branches**: Users can now configure the extension to include remote branches in the branch list, enhancing the switch branch functionality to accommodate workflows that span across both local and remote branches. This setting is enabled by default but can be adjusted in the extension's settings.
- **Pull Changes Option in Switch Branch Functionality**: When switching branches, users now have the option to pull changes from the remote repository automatically if the branch is changed. This feature can be controlled by a new setting, "Default Switch and Pull", which is disabled by default but can be enabled in the extension's settings. Additionally, if the setting is disabled, users are prompted to choose whether they want to pull changes, ensuring flexibility in managing code synchronization.

### Improved
- **Branch Listing Enhancement**: The branch listing now optionally includes remote branches, based on user preference set in the extension's settings. This improvement allows for a more comprehensive overview of available branches, both local and remote, directly within the branch switching interface.

## [0.0.4] - 2024-02-18

### Added
- **Switch Branch Functionality**: Users can now easily switch between their local branches within the selected Git repositories. This feature supports both single and multiple repository workflows, showing branches common to all selected repositories for a unified experience.

## [0.0.3] - 2024-02-18

### Added
- **Multiple Repository Selection**: Users can now select multiple repositories when creating a new branch, allowing batch operations across several repositories within the same workspace.

### Improved
- **Automatic Repository Selection**: The extension now automatically selects the repository if there's only one Git repository in the workspace, streamlining the process of creating a new branch.
- **User Interface Enhancements**: Made minor improvements to the user interface and prompts for clarity and ease of use.

### Fixed
- Minor bugs and performance issues have been addressed to ensure a smoother experience for users.

## [0.0.2] - [Your Previous Version Date]

- Name updated

## [0.0.1] - [Your Initial Release Date]

- Initial release
