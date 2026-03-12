export default interface IGettingData<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
