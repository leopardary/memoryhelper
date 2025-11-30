'use client'
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react'
import { MagnifyingGlassIcon, FaceFrownIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import { useState, useEffect, useCallback } from 'react'
import { MemoryPieceProps } from '@/lib/db/model/types/MemoryPiece.types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/Dashboard/dialog'
import Image from 'next/image'
import { Badge } from '@/app/components/Badge'
import { DESCRIPTION_SEPARATOR, SENTENCE_SEPARATOR } from '@/app/components/utils'

interface SearchResult extends MemoryPieceProps {
  _id: string
}

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedMemoryPiece, setSelectedMemoryPiece] = useState<SearchResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Debounced search function
  const searchMemoryPieces = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=10`)
      const data = await response.json()
      setResults(data.results || [])
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounce effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchMemoryPieces(query)
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [query, searchMemoryPieces])

  const handleSelect = (memoryPiece: SearchResult | null) => {
    if (memoryPiece) {
      setSelectedMemoryPiece(memoryPiece)
      setIsModalOpen(true)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setQuery('')
    setResults([])
  }

  const [wordCombinations, sentenceSamples] = selectedMemoryPiece?.description == null
    ? ['', '']
    : selectedMemoryPiece.description.split(DESCRIPTION_SEPARATOR)
  const sentences = sentenceSamples?.split(SENTENCE_SEPARATOR) || []

  return (
    <>
      <div className="mx-auto w-64 mr-4">
        <Combobox value={null} onChange={handleSelect}>
          <div className="relative">
            <ComboboxInput
              className={clsx(
                'w-full rounded-lg border border-border bg-muted/5 py-1.5 pr-8 pl-10 text-sm/6 text-foreground',
                'focus:outline-none focus:ring-2 focus:ring-primary/50'
              )}
              placeholder="Search memory pieces..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MagnifyingGlassIcon className="size-4 text-muted-foreground" />
            </div>
            {isLoading && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {(results.length > 0 || (query.trim().length > 0 && !isLoading)) && (
            <ComboboxOptions
              anchor="bottom"
              transition
              className={clsx(
                'w-[var(--input-width)] rounded-xl border border-border bg-background p-1 mt-1 shadow-lg max-h-60 overflow-auto',
                'transition duration-100 ease-in data-leave:data-closed:opacity-0'
              )}
            >
              {results.length > 0 ? (
                results.map((memoryPiece) => (
                  <ComboboxOption
                    key={memoryPiece._id}
                    value={memoryPiece}
                    className="group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 select-none hover:bg-muted/50 data-focus:bg-muted/50"
                  >
                    {memoryPiece.imageUrls?.[0] && (
                      <Image
                        src={memoryPiece.imageUrls[0]}
                        alt={memoryPiece.content}
                        width={40}
                        height={40}
                        className="rounded object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {memoryPiece.content}
                      </div>
                      {memoryPiece.labels && memoryPiece.labels.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {memoryPiece.labels.slice(0, 2).map((label, idx) => (
                            <span key={idx} className="text-xs text-muted-foreground">
                              {label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </ComboboxOption>
                ))
              ) : (
                <div className="flex flex-col items-center py-6 px-3 text-center">
                  <FaceFrownIcon className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium text-foreground mb-1">
                    No results found
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Try searching with different keywords
                  </p>
                </div>
              )}
            </ComboboxOptions>
          )}
        </Combobox>
      </div>

      {/* Memory Piece Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {selectedMemoryPiece?.content}
            </DialogTitle>
          </DialogHeader>

          {selectedMemoryPiece && (
            <div className="space-y-4">
              {selectedMemoryPiece.imageUrls?.[0] && (
                <div className="flex justify-center">
                  <Image
                    src={selectedMemoryPiece.imageUrls[0]}
                    alt={selectedMemoryPiece.content}
                    width={400}
                    height={400}
                    className="rounded-lg object-contain max-h-64"
                  />
                </div>
              )}

              {selectedMemoryPiece.labels && selectedMemoryPiece.labels.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedMemoryPiece.labels.map((label, index) => (
                    <Badge key={index} variant="outline">{label}</Badge>
                  ))}
                </div>
              )}

              {wordCombinations && (
                <p className="text-base">{wordCombinations}</p>
              )}

              {sentences.map((sentence: string, idx: number) => (
                sentence && <p key={idx} className="text-sm text-muted-foreground">{sentence}</p>
              ))}

              <div className="pt-4 border-t">
                <a
                  href={`/memorypiece/${selectedMemoryPiece._id}`}
                  className="text-primary hover:underline text-sm"
                  onClick={closeModal}
                >
                  View full details →
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
