<template>
  <Dialog title="Экспорт в календарь">
    <template #trigger>
      <slot name="trigger"/>
    </template>

    <p>Расписание группы или преподавателя можно добавить в приложения, которые поддерживают подписку на календарь:</p>

    <TabsRoot default-value="gcal">
      <div class="tabs">
        <TabsTrigger v-for="(text, key) in tabs" :key="key" :value="key">
          {{ text }}
        </TabsTrigger>
      </div>

      <TabsContent value="gcal">
        <ol>
          <li>На сайте <a href="https://calendar.google.com" target="_blank">Google Calendar</a> нажать на «+» в разделе
            «Другие календари».
          </li>
          <li>Выбрать «Добавить по URL».</li>
          <li>Вставить в поле эту ссылку:
            <CopyText :text="icsLink"/>
            <LectureTypes/>
          </li>
        </ol>
        <p>В начале следующего семестра нужно будет удалить эту подписку из календаря и добавить новую.</p>
      </TabsContent>
      <TabsContent value="ical">
        <ol>
          <li>
            <b>macOS:</b> В меню приложения выбрать «Файл» → «Новая подписка на календарь»<br>
            <b>iOS:</b> В списке календарей нажать «Добавить» → «Добавить подписной календарь»
          </li>
          <li>Вставить в поле эту ссылку:
            <CopyText :text="icsLink"/>
            <LectureTypes/>
          </li>
        </ol>
        <p>В начале следующего семестра нужно будет удалить эту подписку из календаря и добавить новую.</p>
      </TabsContent>
      <TabsContent value="file">
        <ol>
          <li>
            <button class="button" @click="downloadICS">
              <i-tabler-download/>
              Скачать файл .ics
            </button>
            <LectureTypes/>
          </li>
          <li>Импортировать его в приложение календаря.<br>
            <b>Важно:</b> расписание, импортированное из файла, не будет обновляться автоматически.
          </li>
        </ol>
      </TabsContent>
    </TabsRoot>
  </Dialog>
</template>

<script setup lang="tsx">
import Dialog from '@/components/global/Dialog.vue'
import Checkbox from '@/components/global/Checkbox.vue'
import {computed, ref} from 'vue'
import {
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger,
  TabsContent,
  TabsRoot,
  TabsTrigger,
  CheckboxGroupRoot
} from 'reka-ui'
import {useStore} from '@/store.ts'

const tabs = {
  gcal: 'Google Calendar',
  ical: 'Календарь Apple',
  file: 'Файл .ics'
}

const store = useStore()

const calendarName = computed(() => {
  return store.teacher?.name || store.activeGroup?.name
})

const includeLectureTypes = ref(['лек', 'сем', 'экзамен', 'other'])

const icsLink = computed(() => {
  let params = ''
  if (store.teacher) params = `teacher=${store.teacher.id}`
  else if (store.activeGroup) {
    const paramsObj = new URLSearchParams({
      eduform: store.activeGroup.form!,
      course: store.activeGroup.year!.toString(),
      flow: store.activeGroup.id!,
    })
    params = paramsObj.toString()
  }
  if (includeLectureTypes.value.length < 4) {
    params += `&types=${includeLectureTypes.value.join(',')}`
  }
  return `${import.meta.env.VITE_API_URL}/Get_Schedule_Table&${params}&ics=true`
})

async function downloadICS() {
  const ics = await (await fetch(icsLink.value)).text()

  const filename = `${calendarName.value}.ics`
  const url = URL.createObjectURL(new File([ics], filename, {type: 'text/calendar'}))

  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename

  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)

  URL.revokeObjectURL(url)
}

const LectureTypes = () => <CollapsibleRoot class="lecture-types">
  <CollapsibleTrigger>
    Типы пар
    <i-tabler-chevron-down/>
  </CollapsibleTrigger>

  <CollapsibleContent>
    <CheckboxGroupRoot modelValue={includeLectureTypes.value}
                       onUpdate:modelValue={val => includeLectureTypes.value = val}>
      <Checkbox value="лек">Лекции</Checkbox>
      <Checkbox value="сем">Семинары</Checkbox>
      <Checkbox value="экзамен">Экзамены</Checkbox>
      <Checkbox value="other">Другие</Checkbox>
    </CheckboxGroupRoot>
  </CollapsibleContent>
</CollapsibleRoot>
</script>

<style lang="sass" scoped>
.tabs
  display: flex
  gap: 4px 24px
  margin-bottom: 16px
  flex-wrap: wrap

  button
    color: var(--accent)
    text-decoration: underline
    text-decoration-style: dashed
    text-underline-offset: 5px
    position: relative

    &[data-state='active']
      color: var(--text-secondary)
      text-decoration: none
      cursor: default

    &:not(:last-child)::after
      content: '/'
      position: absolute
      right: -14px
      color: var(--text-secondary)
      pointer-events: none
      opacity: .4

.button
  display: flex
  align-items: center
  gap: 6px
  background-color: var(--bg-card)
  color: var(--accent)
  border: 1px solid var(--border)
  box-shadow: var(--shadow)
  width: fit-content
  border-radius: 12px
  padding: 6px 12px
  font-size: 14px
  font-weight: 500
  transition: background-color .1s, color .1s, border-color .1s

  &:hover
    background-color: var(--accent)
    color: white
    border-color: var(--accent)

  .icon
    --icon-size: 16px

li
  margin-block: 8px

.copy
  background-color: var(--bg)
  margin-block: 8px

:deep(.lecture-types)
  > button
    display: flex
    align-items: center
    gap: 4px
    color: var(--text-secondary)
    font-size: 14px
    margin-block: 8px
    transition: color .1s

    &:hover
      color: var(--text)

    .icon
      --icon-size: 16px

    &[data-state="open"]
      margin-bottom: 8px
      color: var(--text)

      .icon
        transform: rotate(180deg)

  .checkbox
    display: inline-flex
    align-items: center
    margin-inline-end: 12px
    margin-block: 4px
</style>