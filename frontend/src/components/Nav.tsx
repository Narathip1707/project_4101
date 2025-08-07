import Link from 'next/link'
import React from 'react'

const Nav = () => {
  return (
    <>
        <nav className="bg-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/">
                    <h1 className="text-white text-lg font-bold">Ramkhamhaeng University</h1>
                </Link>
            </div>
        </nav>
    </>
  )
}

export default Nav