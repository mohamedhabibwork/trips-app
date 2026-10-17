package com.tripsenjoy.ui.components

import androidx.compose.ui.graphics.vector.PathNode
import androidx.compose.ui.graphics.vector.PathParser
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlin.test.assertTrue

class TeIconPathsTest {

    @Test
    fun `path table has one entry for each of the 42 design-system icons`() {
        assertEquals(42, IconName.entries.size)
        assertEquals(IconName.entries.toSet(), iconPathData.keys)
    }

    @Test
    fun `every icon path parses into drawable nodes that start with a move`() {
        IconName.entries.forEach { name ->
            val nodes = PathParser().parsePathString(iconPathData.getValue(name)).toNodes()
            assertTrue(nodes.isNotEmpty(), "$name has no path nodes")
            assertIs<PathNode.MoveTo>(nodes.first(), "$name does not start with a move")
        }
    }
}
