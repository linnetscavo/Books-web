import axios from 'axios'
import { URL_BOOKS } from '@/constants'

export const getBooks = async () => {
  const response = await axios.get(URL_BOOKS)
  return response?.data || []
}

export const getBookById = async (id) => {
  const response = await axios.get(`${URL_BOOKS}/${id}`)
  return response?.data
}

export const createBook = async (bookData) => {
  const response = await axios.post(URL_BOOKS, bookData)
  return response?.data
}

export const updateBook = async (id, bookData) => {
  const response = await axios.put(`${URL_BOOKS}/${id}`, bookData)
  return response?.data
}

export const deleteBook = async (id) => {
  const response = await axios.delete(`${URL_BOOKS}/${id}`)
  return response?.data
}

export const getEmptyBook = () => ({
  id: null,
  title: '',
  author: '',
  year: '',
  genre: '',
  cover: '',
})
