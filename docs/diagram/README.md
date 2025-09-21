# UML

## Component Diagram (By Bozhan)

![UML Component Diagram](UML%20Component%20Diagram.svg)

## Class Diagram (By Jason)

![UML Class Diagram](UML%20Class%20Diagram.svg)

## Sequence Diagram (By Bozhan)

![UML Sequence Diagram](UML%20Sequence%20Diagram.svg)

## Development environment (By Bozhan)

```mermaid
flowchart LR
    subgraph local
    Dev
    Tester

    VSCode[VSCode
    VSCode: v1.104 or above
    Java: Temurin v21
    Ninja: v1.13.1
    Git: 2.50.0 or above
    Android Studio: 2025.1.2
    Other: check package.json]

    Dev -- Code on ---> VSCode
    end

    subgraph GitHub
    OwnBranch[Own Branch]
    main
    PR[Pull Request]
    action[Action
    OS: ubuntu-latest
    Java: Temurin v21
    Ninja: v1.13.1
    Other: check package.json]

    VSCode -- Push to ---> OwnBranch
    OwnBranch -- Create ---> PR

    PR -- Run ---> action
    PR -- Request review ---> Tester

    action -- Approve if success ---> PR
    Tester -- Approve if no error ---> PR

    PR -- Merge to if all checks pass ---> main
    end
```
