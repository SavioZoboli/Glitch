# 🤝 Contribuindo com o Projeto GLITCH

Obrigado por contribuir com o GLITCH! Este projeto é parte do Projeto Aplicado do curso de Análise e Desenvolvimento de Sistemas do UniSENAI.  
Nosso objetivo é criar uma plataforma robusta e acessível para gerenciamento de torneios de e-sports.

Este documento descreve as regras e práticas que seguimos no nosso repositório.

---

## 📁 Estrutura de Branches

```plaintext
main               ← releases estáveis (produção)
develop            ← integração contínua de funcionalidades
feature/nome       ← novas funcionalidades
bugfix/nome        ← correções de bugs
hotfix/nome        ← correções urgentes direto para release
release/x.y.z      ← preparação de nova versão

```
---

## 🔧 Criando sua branch

### Atualize a develop

> git checkout develop
> git pull origin develop

### Crie sua branch

> git checkout -b feature/nome-descritivo
> git push -u origin feature/nome-descritivo

## ✅ Commits com padrão

Use o seguinte padrão de prefixo:

``` plaintext

Tipo	    Quando usar
feat:	    Nova funcionalidade
fix:	    Correção de bug
docs:	    Atualização de documentação
style:	    Formatação, indentação, sem alteração de lógica
refactor:	Refatoração sem nova funcionalidade
test:	    Criação ou ajuste de testes
chore:	    Alterações menores (ex: scripts, configs)

```

Ex.:
> git commit -m "feat: adiciona tela de login"

ou

> git commit -m "docs: adiciona tecnologias à documentação do projeto"

## 🔁 Pull Requests

Um Pull Request (PR) é o processo de propor mudanças em uma branch (geralmente de uma feature, bugfix ou hotfix) para que essas mudanças sejam integradas em outra branch principal (como develop ou main).

No GLITCH, usamos Pull Requests para:

* Revisar código antes de integrar na develop
* Evitar conflitos e retrabalho
* Garantir que tudo funcione antes de entrar em produção

1. Atualize a sua branch develop com os dados da branch remota.
2. Mude para a branch da feature/bug/hotfix que você está trabalhando
3. Faça as alterações que você precisa fazer.
4. Realize os commits normalmente
5. Acesse o [Repo no Github](https://github.com/SavioZoboli/Glitch)
6. Clique em Compare & Pull Requests
7. Preencha o PR
8. Solicite a revisão dos colegas
9. Aguarde o Review
10. O responsável faz o merge

## 🚀 Processo de Release

Quando a develop estiver pronta, criamos uma branch release/x.y.z
Ajustamos documentação e revisão final
Fazemos merge para main + tag:

> git checkout main
> git merge release/x.y.z
> git tag -a vX.Y.Z -m "Release X.Y.Z"
> git push origin main --tags

## 🔒 Boas práticas

Nunca use git push -f sem alinhamento com o grupo
Documente o que for necessário no README
Nomeie suas branches com clareza
Atualize sua branch antes de abrir PR










