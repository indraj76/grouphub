import { useCallback, useEffect, useState } from 'react'
import { errMsg } from '../../services/api'
export default function useAsync(fn, deps) {
  const [s, set] = useState({ data: null, loading: true, error: null })
  const run = useCallback(() => { set(x => ({ ...x, loading: true, error: null })); let live = true
    fn().then(d => live && set({ data: d, loading: false, error: null })).catch(e => live && set({ data: null, loading: false, error: errMsg(e) })); return () => { live = false } }, deps) // eslint-disable-line
  useEffect(run, [run]); return { ...s, retry: run }
}
