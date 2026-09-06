# Agent Workflow Skills

Личный каталог навыков для coding-агентов: от небольших проверок до длительных
процессов с артефактами, возобновлением работы и человеческим ревью.

**MVP 1.0.0 · experimental · published.**
Рабочий dependency-free CLI и четыре skills. Это отдельный toolkit:
ничего не устанавливается в приложение просто от его присутствия в папке.

## Каталог

| Skill | Категория | Сложность | Состояние | Что получает пользователь |
| --- | --- | --- | --- | --- |
| [design-polish](skills/design-polish/SKILL.md) | Design-led implementation | Advanced, stateful workflow | Experimental | Реализованный/уточнённый экран, сравнения, журнал и список оставшихся проблем |
| [project-bootstrap](skills/project-bootstrap/SKILL.md) | Project setup | Workflow | Experimental | Анализ проекта, preset и план установки |
| [skill-author](skills/skill-author/SKILL.md) | Authoring | Workflow | Experimental | Новый skill, границы и сценарии проверки |
| [commit-hook](skills/commit-hook/SKILL.md) | Developer tooling | Planning workflow | Experimental | Предложение hooks; реальная установка пока не реализована |

Машиночитаемый каталог: [catalog.json](catalog.json).
Классификация и сравнение репозиториев: [docs/repository-analysis.md](docs/repository-analysis.md).

## Быстрый старт

### CLI: сначала только preview

Node 22+, без установки зависимостей. Из корня этого starter:

```text
node bin/workflow-kit.mjs init quick-mvp --project <папка-проекта> --host both
node bin/workflow-kit.mjs init enterprise --project <папка-проекта> --host both
```

Это альтернативные presets, не два последовательных шага. После проверки плана
повторите выбранную команду с `--apply`. По умолчанию записи нет.

```text
node bin/workflow-kit.mjs doctor --project <папка-проекта>
node bin/workflow-kit.mjs add commit-hook --project <папка-проекта> --apply
node bin/workflow-kit.mjs update --project <папка-проекта> --dry-run
node bin/workflow-kit.mjs list
node bin/workflow-kit.mjs workflow design-implementation
```

`workflow` показывает контракт для агента, не запускает агента. `add commit-hook`
ставит инструкцию, **не Git hook**. Полный [CLI contract](docs/cli.md).

### Ручная установка отдельного skill

1. Скопируйте **всю** папку `skills/design-polish`, включая references и assets,
   в каталог skills вашего coding-агента. Не копируйте один SKILL.md.
   Для project-local Claude Code используется `.claude/skills/design-polish/`,
   для Codex — `.agents/skills/design-polish/`.
2. В целевом проекте создайте `design-polish.project.json` по
   [шаблону](skills/design-polish/assets/project.example.json).
   Проверьте пути, команды и ограничения. Null и пустые массивы означают
   «не настроено», а не разрешение придумать значения.
3. Откройте сессию агента в целевом проекте. Передайте HTML-экспорт дизайна,
   изображение или инструкции. Если skill ещё не обнаружен, попросите агента
   прочитать установленный SKILL.md явно.
4. Агент сначала анализирует изменения и спрашивает, начинать ли работу.
   После согласия выполняет повторные проходы в согласованном лимите.

Примеры сообщений (это не shell-команды):

```text
/design-polish designs/mobile.dc.html minutes=60 runs=5
$design-polish designs/updated-screen.png pages=checkout
Используй design-polish: реализуй выбранную страницу из приложенного дизайна.
```

Имена gallery-target настраиваются проектом. Например, `circular` может выбрать
круговой layout; это **не** переключатель циклов. Итерации включены всегда,
`runs=1` явно ограничивает задачу одним проходом.

## Что делает design-polish

- Принимает дизайн, обновлённые картинки и текстовые требования.
- Выбирает нужную панель многoстраничного экспорта.
- Отличает polish, recompose и реализацию на существующем каркасе.
- Сверяет хеши дизайна, кода, общих токенов и capture-конфигурации.
- Показывает прошлые скриншоты и одобрения до повторного запуска.
- Снимает реальные reference/before/after, фиксирует нерешённые пункты.
- Сохраняет отдельно «просмотрено» и «устраивает».

Процент — доля проверенно закрытых выявленных расхождений, **не pixel similarity**.
Покрытие конфигураций показывается отдельно. Исторические картинки не доказывают
текущее состояние приложения.

## Требования и границы

Нужен агент с доступом к файлам, редактированию, shell и реальному браузерному
рендеру/просмотру изображений. Skill не содержит браузерный движок, scheduler,
собственный сервер, зависимости Perudo или обязательную подписку на плагин.
Он использует инструменты целевого проекта. Недоступные проверки становятся
блокерами, а не фиктивным успехом. После закрытия сессии работа не гарантируется.

Без отдельной просьбы: никаких commit/push/deploy, смены продуктовых правил,
изменений эталона ради сравнения или публикации пользовательских материалов.

## Структура

```text
bin/                         # npm executable
lib/                         # planner, installer, doctor
presets/                     # quick-mvp, enterprise
workflows/                   # контракты этапов для агента
scripts/check.mjs            # структура, ссылки, syntax
skills/project-bootstrap/
skills/skill-author/
skills/commit-hook/
skills/design-polish/
  SKILL.md
  references/workflow.md
  references/records.md
  assets/project.example.json
  assets/run.example.json
  assets/review-entry.md
docs/
  repository-analysis.md
  release-checklist.md
examples/perudo.project.json
tests/design-polish.scenarios.md
catalog.json
CONTRIBUTING.md
SECURITY.md
LICENSE-DECISION.md
```

## Проверки и публикация

```text
npm test
npm run check
npm pack --dry-run
```

Интеграционные тесты CLI создают временные consumer-проекты и удаляют только
свои fixtures. Они не применяют настройки к Perudo. План следующих шагов:
[future-work.md](docs/future-work.md). package.json пока `private: true`.

Сначала пройдите [сценарии](tests/design-polish.scenarios.md) на временном
тестовом проекте. Переносимость и поведенческая надёжность не следуют из
корректного JSON. Проверяются CLI и fault-injection тесты, структура/синтаксис/ссылки и запуск
из npm-архива в отдельном временном consumer-проекте. Независимые сценарии
поведения агентов пока не выполнены; для setup-skills они перечислены
[отдельно](tests/setup-skills.scenarios.md).

[Checklist первого коммита и релиза](docs/release-checklist.md).
Лицензия ещё не выбрана: [LICENSE-DECISION.md](LICENSE-DECISION.md).
Репозиторий пока нельзя рекламировать как лицензированный open-source пакет.
