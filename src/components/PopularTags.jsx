import React, { useEffect, useState } from 'react';
import bg from '../assets/recipe-taxonomies-bg.svg'


const PopularTags = () => {
    const [tags, setTags] = useState([]);

    useEffect(() => {
        fetch('/tags.json')
            .then(res => res.json())
            .then(data => setTags(data))
            .catch(err => console.error("Failed to fetch tags:", err));
    }, []);

    return (
        <div className=" relative mt-24  text-center py-20 px-4 bg-[#00000010] space-y-6">

            <img
                src={bg}
                alt="Background Decoration"
                className="absolute top-96 lg:top-60 -z-20" 
            />
            <div className="text-center mb-12">
                <h1 className="text-2xl md:text-3xl font-bold mb-8">Explore Popular Tags</h1>
                <p className="text-gray-600 mt-2 max-w-xl mx-auto">
                    From quick meals to healthy dishes, our popular tags make it easy to explore delicious options with one click.
                </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 w-4/5 mx-auto ">
                {tags.map(tag => (
                    <span
                        key={tag.id}
                        className="bg-white text-black px-4 py-2 rounded-full text-sm hover:bg-red-600 hover:text-white transition cursor-pointer"
                    >
                        {tag.name}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default PopularTags;
