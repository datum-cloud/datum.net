import React from 'react'
import PropTypes from 'prop-types'
import BlogsPage from '../../templates/blog-page'

const BlogsPagePreview = ({ entry, getAsset }) => {
    const data = entry.getIn(['data']).toJS()

    if (data) {
        return (
            <BlogsPage
                title={data.title}
                description={data.description}
            />
        )
    } else {
        return <div>Loading...</div>
    }
}

BlogsPagePreview.propTypes = {
    entry: PropTypes.shape({
        getIn: PropTypes.func,
    }),
    getAsset: PropTypes.func,
}

export default BlogsPagePreview
