---
title: Modelo de Clases
---

## Introducción

## Classes
<!-- START autogenerated-classes -->

### Diagrama

```mermaid
classDiagram
{{#each classes as |class|}}

    {{#each SymbolTable.interfaces}}
        {{this}} <|-- {{class.Name}} : implements
    {{/each}}
    {{#if parentClass}}
        {{parentClass}} <|-- {{Name}}
    {{/if}}

    class {{Name}} {
        {{#with SymbolTable}}
            {{import class-public}}
        {{/with}}
    }

    link {{class.Name}} "{{classLinkGraph}}" 
{{/each}}
{{#each namespaces as |namespace|}}
 namespace _{{@key}} {
   {{#each namespace}}
    class {{this}} 
   {{/each}}
}
{{/each}}
```

### Listado

| #   | Name | Api Version | Descripcion |
| --- | ----- | ----------- | ----------- |
{{#each classes}}
| <div class="icons">{{#with TableDeclaration}}{{modifiers}}{{/with}}</div> | [{{Name}}]({{classLink}}) |{{ApiVersion}}|{{description}}|
{{/each}}

{{import class-referencias.md}}
<!-- END autogenerated-classes -->