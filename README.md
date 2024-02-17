# Git Branch Creator for VS Code

The Git Branch Creator extension simplifies the process of creating new Git branches within your Visual Studio Code workspace. It guides users through selecting a Git repository (either the workspace root or a subfolder), choosing a branch prefix, entering a ticket number, and specifying a branch name. This extension is designed to streamline your workflow by enforcing standardized branch naming conventions.

## Features

- **Flexible Repository Selection:** Works with both the root workspace and subfolder Git repositories.
- **Customizable Branch Prefixes:** Configure branch prefixes to match your project's naming conventions.
- **Configurable Branch Name Separator:** Customize the separator used in branch names to fit your team's standards.
- **Interactive Branch Creation:** Guides you through each step of the branch creation process with intuitive prompts.

## Requirements

- Visual Studio Code 1.40.0 or higher.
- Git must be installed and available in your system's PATH.

## Extension Settings

This extension contributes the following settings:

- `branch-creator.prefixes`: An array of prefixes for branch names. Default is `["feature", "hotfix", "bugfix", "general"]`.
- `branch-creator.branchNameSeparator`: The separator used in branch names. Default is `-`.

## Installation

1. Open Visual Studio Code.
2. Press `Ctrl+Shift+X` or navigate to the Extensions view.
3. Search for "Git Branch Creator" and install it.

## Usage

1. Open the Command Palette with `Ctrl+Shift+P`.
2. Type "Create Git Branch" and press Enter.
3. Follow the interactive prompts to select a Git repository, choose a branch prefix, enter a ticket number, and specify a branch name.
4. Confirm the creation of the new branch when prompted.

## Customizing

To customize the branch prefixes and name separator:

1. Go to `File > Preferences > Settings` (or `Code > Preferences > Settings` on macOS).
2. Search for "Git Branch Creator".
3. Edit the settings directly or click on `Edit in settings.json` to customize.

Alternatively, you can modify your `settings.json` directly:

```json
{
  "branch-creator.prefixes": ["feature", "hotfix", "bugfix", "release"],
  "branch-creator.branchNameSeparator": "_"
}
```
## Contributing

Contributions are always welcome! If you'd like to contribute, please follow these steps:

1. Fork the repository on GitHub.
2. Create a new branch for your feature or fix.
3. Commit your changes in your feature branch.
4. Push your branch and submit a pull request to the main repository.

When contributing, please keep the following in mind:
- Try to adhere to the coding style used throughout the project.
- Include comments in your code where necessary to explain complex logic.
- Update the README.md with details of changes to the interface or significant logic.

For more detailed information on how to contribute, please refer to the CONTRIBUTING.md file in the repository (if available).

## License

This extension is released under the MIT License. See the [LICENSE](LICENSE) file in the repository for more details.
