export default function Sidebar({ appName, menuItems, additionalContent  }) {
    
    return(
        <div className="w-64 bg-white p-6 fixed inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out" id="sidebar">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
                <a href="/bookmarks" className="hover:underline">{appName}</a>
            </h1>
        </div>
        <nav className="space-y-1">
            {menuItems.map((item, index) => (
            <a key={index} className="block py-2.5 px-4 rounded hover:bg-blue-500 hover:text-white" href={item.url}>
                {item.text}
            </a>
            ))}
        </nav>
        {/* Render additional content */}
        {additionalContent}        
        </div>
    );

}