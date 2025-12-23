# Configuração de Permissões iOS - App Store Compliance

## Strings de Permissão (Info.plist)

Quando executares `npx cap add ios` e abrires o projeto no Xcode, adiciona as seguintes chaves ao ficheiro `ios/App/App/Info.plist`:

### Câmara (Obrigatório)
```xml
<key>NSCameraUsageDescription</key>
<string>O METAFIT precisa de acesso à câmara para tirares fotos das tuas refeições. A nossa inteligência artificial analisa a foto para calcular automaticamente as calorias, proteínas, carboidratos e gorduras presentes no teu prato.</string>
```

### Galeria de Fotos - Leitura (Obrigatório)
```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>O METAFIT precisa de acesso à tua galeria de fotos para que possas seleccionar imagens de refeições já tiradas. Estas fotos são analisadas pela nossa IA para calcular os valores nutricionais da refeição.</string>
```

### Galeria de Fotos - Escrita (Opcional)
```xml
<key>NSPhotoLibraryAddUsageDescription</key>
<string>O METAFIT pode guardar as fotos das tuas análises de refeições na galeria para que possas consultá-las mais tarde.</string>
```

## Como Adicionar no Xcode

1. Abre o projeto iOS: `npx cap open ios`
2. No Xcode, selecciona o ficheiro `Info.plist` no navegador de ficheiros
3. Clica com botão direito e selecciona "Add Row"
4. Adiciona cada uma das chaves acima com os valores correspondentes
5. Guarda o ficheiro (Cmd+S)

## Verificação

Antes de submeter à App Store, verifica que:
- [x] NSCameraUsageDescription está presente e explica claramente o uso
- [x] NSPhotoLibraryUsageDescription está presente e explica claramente o uso
- [x] As descrições mencionam especificamente "análise de refeições" e "calcular calorias"
- [x] As descrições estão em português

## Notas Importantes

- A Apple rejeita apps com descrições vagas como "A app precisa de acesso à câmara"
- As descrições devem explicar COMO os dados serão usados
- Incluir um exemplo específico de uso é recomendado
