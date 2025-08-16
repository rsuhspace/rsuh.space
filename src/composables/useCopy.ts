import {type MaybeRefOrGetter, ref, toValue} from 'vue'

export default function useCopy(text: MaybeRefOrGetter<string>) {
  const isCopied = ref(false)
  let copyTimeout: number

  function copy() {
    navigator.clipboard.writeText(decodeURIComponent(toValue(text)))
    clearTimeout(copyTimeout)
    isCopied.value = true
    copyTimeout = setTimeout(() => {
      isCopied.value = false
    }, 2000)
  }

  return {
    copy,
    isCopied
  }
}