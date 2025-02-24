import React from 'react'
import HomepageTemplate from '../../templates/homepage'

const IndexPagePreview = ({ entry, getAsset }) => {
  const data = entry.getIn(['data']).toJS()

  if (data) {
    return (
      <HomepageTemplate
        image={getAsset(data.image)}
        title={data.title}
        description={data.description}
      />
    )
  } else {
    return <div>Loading...</div>
  }
}

export default IndexPagePreview
