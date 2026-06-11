import axios from 'axios';
interface Blog { id: string }
const client = axios.create();
const getBlog = () => client.get<any, Blog>('/blog');
getBlog().then(b => console.log(b.id));
